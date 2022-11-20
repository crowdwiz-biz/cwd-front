import WalletUnlockActions from "actions/WalletUnlockActions";
import WalletDb from "stores/WalletDb";
import {
    Aes,
    ChainValidation,
    TransactionBuilder,
    TransactionHelper,
    FetchChain,
    ChainStore
} from "bitsharesjs";
import counterpart from "counterpart";
import {Notification} from "crowdwiz-ui-modal";

const ApplicationApi = {
    create_account(
        owner_pubkey,
        active_pubkey,
        memo_pubkey,
        new_account_name,
        registrar,
        referrer,
        referrer_percent,
        broadcast = false
    ) {
        ChainValidation.required(registrar, "registrar_id");
        ChainValidation.required(referrer, "referrer_id");

        return new Promise((resolve, reject) => {
            return Promise.all([
                FetchChain("getAccount", registrar),
                FetchChain("getAccount", referrer)
            ]).then(res => {
                let [chain_registrar, chain_referrer] = res;

                let tr = new TransactionBuilder();
                tr.add_type_operation("account_create", {
                    fee: {
                        amount: 0,
                        asset_id: 0
                    },
                    registrar: chain_registrar.get("id"),
                    referrer: chain_referrer.get("id"),
                    referrer_percent: referrer_percent,
                    name: new_account_name,
                    owner: {
                        weight_threshold: 1,
                        account_auths: [],
                        key_auths: [[owner_pubkey, 1]],
                        address_auths: []
                    },
                    active: {
                        weight_threshold: 1,
                        account_auths: [],
                        key_auths: [[active_pubkey, 1]],
                        address_auths: []
                    },
                    options: {
                        memo_key: memo_pubkey,
                        voting_account: "1.2.5",
                        num_witness: 0,
                        num_committee: 0,
                        votes: []
                    }
                });
                return WalletDb.process_transaction(
                    tr,
                    null, //signer_private_keys,
                    broadcast
                )
                    .then(res => {
                        console.log("process_transaction then", res);
                        resolve();
                    })
                    .catch(err => {
                        console.log("process_transaction catch", err);
                        reject(err);
                    });
            });
        });
    },

    _get_memo_keys(account, with_private_keys = true) {
        let memo = {
            public_key: null,
            private_key: null
        };
        memo.public_key = account.getIn(["options", "memo_key"]);
        // The 1s are base58 for all zeros (null)
        if (/111111111111111111111/.test(memo.public_key)) {
            memo.public_key = null;
        }
        if (with_private_keys) {
            memo.private_key = WalletDb.getPrivateKey(memo.public_key);
            if (!memo.private_key) {
                Notification.error({
                    message: counterpart.translate(
                        "account.errors.memo_missing"
                    )
                });
                throw new Error(
                    "Missing private memo key for sender: " +
                        account.get("name")
                );
            }
        }
        return memo;
    },

    _create_transfer_op({
        // OBJECT: { ... }
        from_account,
        to_account,
        amount,
        asset,
        memo,
        propose_account = null, // should be called memo_sender, but is not for compatibility reasons with transfer. Is set to "from_account" for non proposals
        encrypt_memo = true,
        optional_nonce = null,
        fee_asset_id = "1.3.0",
        transactionBuilder = null
    }) {
        let unlock_promise = WalletUnlockActions.unlock();

        let memo_sender_account = propose_account || from_account;
        return Promise.all([
            FetchChain("getAccount", from_account),
            FetchChain("getAccount", to_account),
            FetchChain("getAccount", memo_sender_account),
            FetchChain("getAsset", asset),
            FetchChain("getAsset", fee_asset_id),
            unlock_promise
        ])
            .then(res => {
                let [
                    chain_from,
                    chain_to,
                    chain_memo_sender,
                    chain_asset,
                    chain_fee_asset
                ] = res;

                let chain_propose_account = null;
                if (propose_account) {
                    chain_propose_account = chain_memo_sender;
                }

                let memo_object;
                if (memo) {
                    let memo_sender = this._get_memo_keys(
                        chain_memo_sender,
                        encrypt_memo
                    );
                    let memo_to = this._get_memo_keys(chain_to, false);
                    if (!!memo_sender.public_key && !!memo_to.public_key) {
                        let nonce =
                            optional_nonce == null
                                ? TransactionHelper.unique_nonce_uint64()
                                : optional_nonce;
                        memo_object = {
                            from: memo_sender.public_key,
                            to: memo_to.public_key,
                            nonce,
                            message: encrypt_memo
                                ? Aes.encrypt_with_checksum(
                                      memo_sender.private_key,
                                      memo_to.public_key,
                                      nonce,
                                      memo
                                  )
                                : Buffer.isBuffer(memo)
                                ? memo.toString("utf-8")
                                : memo
                        };
                    }
                }

                // Allow user to choose asset with which to pay fees #356
                let fee_asset = chain_fee_asset.toJS();

                // Default to CORE in case of faulty core_exchange_rate
                if (
                    fee_asset.options.core_exchange_rate.base.asset_id ===
                        "1.3.0" &&
                    fee_asset.options.core_exchange_rate.quote.asset_id ===
                        "1.3.0"
                ) {
                    fee_asset_id = "1.3.0";
                }

                let tr = null;
                if (transactionBuilder == null) {
                    tr = new TransactionBuilder();
                } else {
                    tr = transactionBuilder;
                }
                let transfer_op = tr.get_type_operation("transfer", {
                    fee: {
                        amount: 0,
                        asset_id: fee_asset_id
                    },
                    from: chain_from.get("id"),
                    to: chain_to.get("id"),
                    amount: {amount, asset_id: chain_asset.get("id")},
                    memo: memo_object
                });
                if (__DEV__) {
                    console.log("built transfer", transfer_op);
                }
                return {
                    transfer_op,
                    chain_from,
                    chain_to,
                    chain_propose_account,
                    chain_memo_sender,
                    chain_asset,
                    chain_fee_asset
                };
            })
            .catch(err => {
                console.error(err);
            });
    },

    /**
     @param propose_account (or null) pays the fee to create the proposal, also used as memo from
     */
    transfer({
        // OBJECT: { ... }
        from_account,
        to_account,
        amount,
        asset,
        memo,
        broadcast = true,
        encrypt_memo = true,
        optional_nonce = null,
        propose_account = null,
        fee_asset_id = "1.3.0",
        transactionBuilder = null
    }) {
        if (transactionBuilder == null) {
            transactionBuilder = new TransactionBuilder();
        }
        return this._create_transfer_op({
            from_account,
            to_account,
            amount,
            asset,
            memo,
            propose_account,
            encrypt_memo,
            optional_nonce,
            fee_asset_id,
            transactionBuilder
        }).then(transfer_obj => {
            return transactionBuilder
                .update_head_block()
                .then(() => {
                    if (propose_account) {
                        transactionBuilder.add_type_operation(
                            "proposal_create",
                            {
                                proposed_ops: [{op: transfer_obj.transfer_op}],
                                fee_paying_account: transfer_obj.chain_propose_account.get(
                                    "id"
                                )
                            }
                        );
                    } else {
                        transactionBuilder.add_operation(
                            transfer_obj.transfer_op
                        );
                    }
                    return WalletDb.process_transaction(
                        transactionBuilder,
                        null, //signer_private_keys,
                        broadcast
                    );
                })
                .catch(err => {
                    console.error(err);
                });
        });
    },

    _create_sendcontacts_op(
        // OBJECT: { ... }
        lot_id,
        from_account,
        to_account,
        memo,
        encrypt_memo = true,
        optional_nonce = null,
        fee_asset_id = "1.3.0",
        transactionBuilder = null
    ) {
        let unlock_promise = WalletUnlockActions.unlock();

        let memo_sender_account = from_account;
        return Promise.all([
            FetchChain("getAccount", from_account),
            FetchChain("getAccount", to_account),
            FetchChain("getAccount", memo_sender_account),
            FetchChain("getAsset", fee_asset_id),
            unlock_promise
        ])
            .then(res => {
                let [
                    chain_from,
                    chain_to,
                    chain_memo_sender,
                    chain_fee_asset
                ] = res;

                let memo_object;
                if (memo) {
                    let memo_sender = this._get_memo_keys(
                        chain_memo_sender,
                        encrypt_memo
                    );
                    let memo_to = this._get_memo_keys(chain_to, false);
                    if (!!memo_sender.public_key && !!memo_to.public_key) {
                        let nonce = TransactionHelper.unique_nonce_uint64();
                        memo_object = {
                            from: memo_sender.public_key,
                            to: memo_to.public_key,
                            nonce,
                            message: Aes.encrypt_with_checksum(
                                memo_sender.private_key,
                                memo_to.public_key,
                                nonce,
                                memo
                            )
                        };
                    }
                }

                // Allow user to choose asset with which to pay fees #356
                let fee_asset = chain_fee_asset.toJS();

                // Default to CORE in case of faulty core_exchange_rate
                if (
                    fee_asset.options.core_exchange_rate.base.asset_id ===
                        "1.3.0" &&
                    fee_asset.options.core_exchange_rate.quote.asset_id ===
                        "1.3.0"
                ) {
                    fee_asset_id = "1.3.0";
                }

                let tr = null;
                if (transactionBuilder == null) {
                    tr = new TransactionBuilder();
                } else {
                    tr = transactionBuilder;
                }
                let sendcontacts_op = tr.get_type_operation(
                    "lottery_goods_send_contacts",
                    {
                        fee: {
                            amount: 0,
                            asset_id: fee_asset_id
                        },
                        lot_id: lot_id,
                        winner: chain_from.get("id"),
                        owner: chain_to.get("id"),
                        winner_contacts: memo_object
                    }
                );

                return {
                    sendcontacts_op,
                    chain_from,
                    chain_to,
                    chain_memo_sender,
                    chain_fee_asset
                };
            })
            .catch(err => {
                console.error(err);
            });
    },

    sendcontacts(
        // OBJECT: { ... }
        lot_id,
        from_account,
        to_account,
        memo,
        broadcast = true,
        encrypt_memo = true,
        optional_nonce = null,
        fee_asset_id = "1.3.0",
        transactionBuilder = null
    ) {
        if (transactionBuilder == null) {
            transactionBuilder = new TransactionBuilder();
        }

        return this._create_sendcontacts_op(
            lot_id,
            from_account,
            to_account,
            memo,
            encrypt_memo,
            optional_nonce,
            fee_asset_id,
            transactionBuilder
        ).then(sendcontacts_obj => {
            return transactionBuilder
                .update_head_block()
                .then(() => {
                    transactionBuilder.add_operation(
                        sendcontacts_obj.sendcontacts_op
                    );

                    return WalletDb.process_transaction(
                        transactionBuilder,
                        null, //signer_private_keys,
                        broadcast
                    );
                })
                .catch(err => {
                    console.error(err);
                });
        });
    },

    transfer_list(list_of_transfers) {
        return WalletUnlockActions.unlock().then(() => {
            let proposer = null;
            let transfers = [];
            let tr = new TransactionBuilder();
            list_of_transfers.forEach(transferData => {
                transferData.transactionBuilder = tr;
                transfers.push(this._create_transfer_op(transferData));
            });
            console.log(transfers);

            return Promise.all(transfers)
                .then(result => {
                    return tr.update_head_block().then(() => {
                        let propose = [];
                        result.forEach((item, idx) => {
                            if (list_of_transfers[idx].propose_account) {
                                if (proposer == null) {
                                    proposer = item.chain_propose_account;
                                }
                                propose.push({op: item.transfer_op});
                            } else {
                                tr.add_operation(item.transfer_op);
                            }
                        });
                        tr.add_type_operation("proposal_create", {
                            proposed_ops: propose,
                            fee_paying_account: proposer.get("id")
                        });
                        return WalletDb.process_transaction(
                            tr,
                            null, //signer_private_keys,
                            true
                        );
                    });
                })
                .catch(err => {
                    console.log(err);
                });
        });
    },

    issue_asset(
        to_account,
        from_account,
        asset_id,
        amount,
        memo,
        encrypt_memo = true,
        optional_nonce = null
    ) {
        let unlock_promise = WalletUnlockActions.unlock();

        return Promise.all([
            FetchChain("getAccount", from_account),
            FetchChain("getAccount", to_account),
            unlock_promise
        ]).then(res => {
            let [chain_memo_sender, chain_to] = res;

            let memo_from_public, memo_to_public;
            if (memo && encrypt_memo) {
                memo_from_public = chain_memo_sender.getIn([
                    "options",
                    "memo_key"
                ]);

                // The 1s are base58 for all zeros (null)
                if (/111111111111111111111/.test(memo_from_public)) {
                    memo_from_public = null;
                }

                memo_to_public = chain_to.getIn(["options", "memo_key"]);
                if (/111111111111111111111/.test(memo_to_public)) {
                    memo_to_public = null;
                }
            }

            let memo_from_privkey;
            if (encrypt_memo && memo) {
                memo_from_privkey = WalletDb.getPrivateKey(memo_from_public);

                if (!memo_from_privkey) {
                    throw new Error(
                        "Missing private memo key for sender: " + from_account
                    );
                }
            }

            let memo_object;
            if (memo && memo_to_public && memo_from_public) {
                let nonce =
                    optional_nonce == null
                        ? TransactionHelper.unique_nonce_uint64()
                        : optional_nonce;

                memo_object = {
                    from: memo_from_public,
                    to: memo_to_public,
                    nonce,
                    message: encrypt_memo
                        ? Aes.encrypt_with_checksum(
                              memo_from_privkey,
                              memo_to_public,
                              nonce,
                              memo
                          )
                        : Buffer.isBuffer(memo)
                        ? memo.toString("utf-8")
                        : memo
                };
            }

            let tr = new TransactionBuilder();
            tr.add_type_operation("asset_issue", {
                fee: {
                    amount: 0,
                    asset_id: 0
                },
                issuer: from_account,
                asset_to_issue: {
                    amount: amount,
                    asset_id: asset_id
                },
                issue_to_account: to_account,
                memo: memo_object
            });

            return WalletDb.process_transaction(tr, null, true);
        });
    },

    createWorker(options, account) {
        return new Promise((resolve, reject) => {
            let tr = new TransactionBuilder();
            const core = ChainStore.getAsset("1.3.0");
            if (!core)
                reject(new Error("Can't find core asset, please try again"));
            let precision = Math.pow(10, core.get("precision"));

            const owner = ChainStore.getAccount(account).get("id");
            if (!owner)
                reject(
                    new Error("Can't find the owner account, please try again")
                );

            try {
                tr.add_type_operation("worker_create", {
                    fee: {
                        amount: 0,
                        asset_id: 0
                    },
                    owner,
                    work_begin_date: options.start,
                    work_end_date: options.end,
                    daily_pay: options.pay * precision,
                    name: options.title,
                    url: options.url,
                    initializer: [1, {pay_vesting_period_days: options.vesting}]
                });
            } catch (err) {
                reject(err);
            }
            WalletDb.process_transaction(tr, null, true)
                .then(resolve)
                .catch(reject);
        });
    },

    updateAccount(updateObject) {
        let tr = new TransactionBuilder();
        tr.add_type_operation("account_update", updateObject);
        return WalletDb.process_transaction(tr, null, true);
    }
};

export default ApplicationApi;
