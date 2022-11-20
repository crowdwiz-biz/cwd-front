import alt from "alt-instance";
import accountUtils from "common/account_utils";
import AccountApi from "api/accountApi";

import WalletApi from "api/WalletApi";
import ApplicationApi from "api/ApplicationApi";
import WalletDb from "stores/WalletDb";
import WalletActions from "actions/WalletActions";
import counterpart from "counterpart";
import {
    TransactionBuilder,
    Aes,
    FetchChain,
    TransactionHelper
} from "bitsharesjs";

let accountSearch = {};

/**
 *  @brief  Actions that modify linked accounts
 *
 *  @note this class also includes accountSearch actions which keep track of search result state.  The presumption
 *  is that there is only ever one active "search result" at a time.
 */
class AccountActions {
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
    }

    async createMemo(from, to, message) {
        let res = await Promise.all([
            FetchChain("getAccount", from),
            FetchChain("getAccount", to)
        ]);
        let memo = new Buffer(message, "utf-8");
        let memo_object;
        let [chain_from, chain_to] = res;
        let memo_sender = this._get_memo_keys(chain_from, true);
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
        return memo_object;
    }

    /**
     *  Account search results are not managed by the ChainStore cache so are
     *  tracked as part of the AccountStore.
     */

    accountSearch(start_symbol, limit = 50) {
        let uid = `${start_symbol}_${limit}}`;
        return dispatch => {
            if (!accountSearch[uid]) {
                accountSearch[uid] = true;
                return AccountApi.lookupAccounts(start_symbol, limit).then(
                    result => {
                        accountSearch[uid] = false;
                        dispatch({ accounts: result, searchTerm: start_symbol });
                    }
                );
            }
        };
    }

    /**
     *  TODO:  The concept of current accounts is deprecated and needs to be removed
     */
    setCurrentAccount(name) {
        return name;
    }

    setNeverShowBrowsingModeNotice(value) {
        return value;
    }

    tryToSetCurrentAccount() {
        return true;
    }

    addStarAccount(account) {
        return account;
    }

    removeStarAccount(account) {
        return account;
    }

    toggleHideAccount(account, hide) {
        return { account, hide };
    }

    /**
     *  TODO:  This is a function of teh WalletApi and has no business being part of AccountActions
     */
    transfer(
        from_account,
        to_account,
        amount,
        asset,
        memo,
        propose_account = null,
        fee_asset_id = "1.3.0"
    ) {
        // Set the fee asset to use
        fee_asset_id = accountUtils.getFinalFeeAsset(
            propose_account || from_account,
            "transfer",
            fee_asset_id
        );

        try {
            return dispatch => {
                return ApplicationApi.transfer({
                    from_account,
                    to_account,
                    amount,
                    asset,
                    memo,
                    propose_account,
                    fee_asset_id
                }).then(result => {
                    // console.log( "transfer result: ", result )

                    dispatch(result);
                });
            };
        } catch (error) {
            console.log(
                "[AccountActions.js:90] ----- transfer error ----->",
                error
            );
            return new Promise((resolve, reject) => {
                reject(error);
            });
        }
    }

    /**
     *  This method exists ont he AccountActions because after creating the account via the wallet, the account needs
     *  to be linked and added to the local database.
     */
    createAccount(
        account_name,
        registrar,
        referrer,
        referrer_percent,
        refcode
    ) {
        return dispatch => {
            return WalletActions.createAccount(
                account_name,
                registrar,
                referrer,
                referrer_percent,
                refcode
            ).then(() => {
                dispatch(account_name);
                return account_name;
            });
        };
    }

    createAccountWithPassword(
        account_name,
        password,
        registrar,
        referrer,
        referrer_percent,
        refcode
    ) {
        return dispatch => {
            return WalletActions.createAccountWithPassword(
                account_name,
                password,
                registrar,
                referrer,
                referrer_percent,
                refcode
            ).then(() => {
                dispatch(account_name);
                return account_name;
            });
        };
    }

    /**
     *  TODO:  This is a function of the WalletApi and has no business being part of AccountActions, the account should already
     *  be linked.
     */
    upgradeAccount(account_id, lifetime) {
        // Set the fee asset to use
        let fee_asset_id = accountUtils.getFinalFeeAsset(
            account_id,
            "account_upgrade"
        );

        var tr = WalletApi.new_transaction();
        tr.add_type_operation("account_upgrade", {
            fee: {
                amount: 0,
                asset_id: fee_asset_id
            },
            account_to_upgrade: account_id,
            upgrade_to_lifetime_member: lifetime
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    upgradeStatusAccount(account_id, statusType) {
        // Set the fee asset to use
        let fee_asset_id = accountUtils.getFinalFeeAsset(
            account_id,
            "account_status_upgrade"
        );

        var tr = WalletApi.new_transaction();
        tr.add_type_operation("account_status_upgrade", {
            fee: {
                amount: 0,
                asset_id: fee_asset_id
            },
            account_to_upgrade: account_id,
            referral_status_type: statusType
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    //GAMEZONE OPERATIONS
    flipcoinBet(bettor, bet) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("flipcoin_bet", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            bettor: bettor,
            bet: { amount: bet, asset_id: "1.3.0" },
            nonce: Math.round(Math.random() * 20)
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    flipcoinCall(flipcoin, caller, bet) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("flipcoin_call", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            flipcoin: flipcoin,
            caller: caller,
            bet: { amount: bet, asset_id: "1.3.0" }
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    //LOTTERY
    lotteryBuyTicket(lot_id, participant, ticket_price) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("lottery_goods_buy_ticket", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            lot_id: lot_id,
            participant: participant,
            ticket_price: { amount: ticket_price, asset_id: "1.3.0" }
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    lotteryAddLot(owner_id, participants, ticket_price, img_url, description) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("lottery_goods_create_lot", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            owner: owner_id,
            total_participants: parseInt(participants),
            ticket_price: { amount: ticket_price, asset_id: "1.3.0" },
            latency_sec: 50,
            img_url: img_url,
            description: description
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    confirmDelivery(lot_id, winner, owner) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("lottery_goods_confirm_delivery", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            lot_id: lot_id,
            winner: winner,
            owner: owner
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    sendContacts(lot_id, winner, owner, winner_contacts) {
        try {
            return dispatch => {
                return ApplicationApi.sendcontacts(
                    lot_id,
                    winner,
                    owner,
                    winner_contacts
                ).then(result => {
                    dispatch(result);
                });
            };
        } catch (error) {
            console.log(
                "[AccountActions.js:90] ----- sendContacts error ----->",
                error
            );
            return new Promise((resolve, reject) => {
                reject(error);
            });
        }
    }

    //MATRIX
    matrixOpenRoom(matrix_id, player, matrix_level, level_price) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("matrix_open_room", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            matrix_id: matrix_id,
            player: player,
            matrix_level: matrix_level,
            level_price: { amount: level_price, asset_id: "1.3.0" }
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    //P2P exchange

    // TEMPLATE
    // P2p(p2p_adv, p2p_gateway) {
    //     var tr = WalletApi.new_transaction();
    //     tr.add_type_operation("", {
    //         fee: {
    //             amount: 0,
    //             asset_id: "1.3.0"
    //         },
    //         p2p_adv: p2p_adv, //Maybe dont change
    //         p2p_gateway: p2p_gateway
    //     });
    //     return WalletDb.process_transaction(tr, null, true);
    // }
    // TEMPLATE

    createP2pAdv(
        p2p_gateway,
        adv_type,
        adv_description,
        max_cwd,
        min_cwd,
        price,
        currency,
        min_p2p_complete_deals,
        min_account_status,
        timelimit_for_reply,
        timelimit_for_approve,
        geo
    ) {
        var tr = WalletApi.new_transaction();

        tr.add_type_operation("create_p2p_adv", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            p2p_gateway: p2p_gateway,
            adv_type: adv_type,
            adv_description: adv_description,
            max_cwd: max_cwd,
            min_cwd: min_cwd,
            price: price,
            currency: currency,
            min_p2p_complete_deals: min_p2p_complete_deals,
            min_account_status: min_account_status,
            timelimit_for_reply: timelimit_for_reply,
            timelimit_for_approve: timelimit_for_approve,
            geo: geo
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    editP2pAdv(
        p2p_adv,
        p2p_gateway,
        adv_type,
        adv_description,
        max_cwd,
        min_cwd,
        price,
        currency,
        min_p2p_complete_deals,
        min_account_status,
        timelimit_for_reply,
        timelimit_for_approve,
        geo,
        status
    ) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("edit_p2p_adv", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            p2p_adv: p2p_adv,
            p2p_gateway: p2p_gateway,
            adv_type: adv_type,
            adv_description: adv_description,
            max_cwd: max_cwd,
            min_cwd: min_cwd,
            price: price,
            currency: currency,
            min_p2p_complete_deals: min_p2p_complete_deals,
            min_account_status: min_account_status,
            timelimit_for_reply: timelimit_for_reply,
            timelimit_for_approve: timelimit_for_approve,
            geo: geo,
            status: status
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    clearP2pAdvBlackList(p2p_adv, p2p_gateway) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("clear_p2p_adv_black_list", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            p2p_adv: p2p_adv,
            p2p_gateway: p2p_gateway
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    removeFromP2pAdvBlackList(p2p_adv, p2p_gateway, blacklisted) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("remove_from_p2p_adv_black_list", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            p2p_adv: p2p_adv,
            p2p_gateway: p2p_gateway,
            blacklisted: blacklisted
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    createP2pOrder(
        p2p_adv,
        amount,
        price,
        p2p_gateway,
        p2p_client,
        payment_details
    ) {
        if (payment_details) {
            this.createMemo(p2p_client, p2p_gateway, payment_details).then(
                res => {
                    var tr = WalletApi.new_transaction();
                    tr.add_type_operation("create_p2p_order", {
                        fee: {
                            amount: 0,
                            asset_id: "1.3.0"
                        },
                        p2p_adv: p2p_adv,
                        amount: {
                            amount: amount,
                            asset_id: "1.3.0"
                        },
                        price: price,
                        p2p_gateway: p2p_gateway,
                        p2p_client: p2p_client,
                        payment_details: res
                    });
                    return WalletDb.process_transaction(tr, null, true);
                }
            );
        } else {
            var tr = WalletApi.new_transaction();
            tr.add_type_operation("create_p2p_order", {
                fee: {
                    amount: 0,
                    asset_id: "1.3.0"
                },
                p2p_adv: p2p_adv,
                amount: {
                    amount: amount,
                    asset_id: "1.3.0"
                },
                price: price,
                p2p_gateway: p2p_gateway,
                p2p_client: p2p_client
            });
            return WalletDb.process_transaction(tr, null, true);
        }
    }

    cancelP2pOrder(p2p_order, p2p_gateway, p2p_client, blacklist) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("cancel_p2p_order", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            p2p_gateway: p2p_gateway,
            p2p_client: p2p_client,
            p2p_order: p2p_order,
            blacklist: blacklist
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    callP2pOrder(
        p2p_order,
        p2p_gateway,
        p2p_client,
        amount,
        price,
        payment_details
    ) {
        this.createMemo(p2p_gateway, p2p_client, payment_details).then(res => {
            var tr = WalletApi.new_transaction();
            tr.add_type_operation("call_p2p_order", {
                fee: {
                    amount: 0,
                    asset_id: "1.3.0"
                },
                p2p_order: p2p_order,
                p2p_gateway: p2p_gateway,
                p2p_client: p2p_client,
                amount: {
                    amount: amount,
                    asset_id: "1.3.0"
                },
                price: price,
                payment_details: res
            });
            return WalletDb.process_transaction(tr, null, true);
        });
    }

    paymentP2pOrder(p2p_order, paying_account, recieving_account, file_hash) {
        this.createMemo(paying_account, recieving_account, file_hash).then(
            res => {
                var tr = WalletApi.new_transaction();
                tr.add_type_operation("payment_p2p_order", {
                    fee: {
                        amount: 0,
                        asset_id: "1.3.0"
                    },
                    p2p_order: p2p_order,
                    paying_account: paying_account,
                    recieving_account: recieving_account,
                    file_hash: res
                });
                return WalletDb.process_transaction(tr, null, true);
            }
        );
    }

    release_p2p_order(p2p_order, paying_account, recieving_account) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("release_p2p_order", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            p2p_order: p2p_order,
            paying_account: paying_account,
            recieving_account: recieving_account
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    openP2pDispute(p2p_order, account, defendant, arbitr, contact_details) {
        this.createMemo(account, arbitr, contact_details).then(res => {
            var tr = WalletApi.new_transaction();
            tr.add_type_operation("open_p2p_dispute", {
                fee: {
                    amount: 0,
                    asset_id: "1.3.0"
                },
                p2p_order: p2p_order,
                account: account,
                defendant: defendant,
                arbitr: arbitr,
                contact_details: res
            });
            return WalletDb.process_transaction(tr, null, true);
        });
    }

    replyP2pDispute(p2p_order, account, arbitr, contact_details) {
        this.createMemo(account, arbitr, contact_details).then(res => {
            var tr = WalletApi.new_transaction();
            tr.add_type_operation("reply_p2p_dispute", {
                fee: {
                    amount: 0,
                    asset_id: "1.3.0"
                },
                p2p_order: p2p_order,
                account: account,
                arbitr: arbitr,
                contact_details: res
            });
            return WalletDb.process_transaction(tr, null, true);
        });
    }

    resolveP2pDispute(p2p_order, arbitr, winner, looser) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("resolve_p2p_dispute", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            p2p_order: p2p_order,
            arbitr: arbitr,
            winner: winner,
            looser: looser
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    //SYSTEM CREDIT
    credit_system_get(debitor, credit_amount) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("credit_system_get", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            debitor: debitor,
            credit_amount: { amount: credit_amount, asset_id: "1.3.0" }
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    // SEND MESSAGE
    sendMessage(from_acc, to, memo) {
        this.createMemo(from_acc, to, memo).then(res => {
            var tr = WalletApi.new_transaction();
            tr.add_type_operation("send_message", {
                fee: {
                    amount: 0,
                    asset_id: "1.3.0"
                },
                from: from_acc,
                to: to,
                memo: res
            });

            return WalletDb.process_transaction(tr, null, true);
        });
    }

    //PLEDGE OFFERS
    pledge_offer_give_create(
        creditor,
        pledge_amount,
        pledge_asset_id,
        credit_amount,
        credit_asset_id,
        repay_amount,
        repay_asset_id,
        pledge_days
    ) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("pledge_offer_give_create", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            creditor: creditor,
            pledge_amount: { amount: pledge_amount, asset_id: pledge_asset_id },
            credit_amount: { amount: credit_amount, asset_id: credit_asset_id },
            repay_amount: { amount: repay_amount, asset_id: repay_asset_id },
            pledge_days: pledge_days
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    pledge_offer_take_create(
        debitor,
        pledge_amount,
        pledge_asset_id,
        credit_amount,
        credit_asset_id,
        repay_amount,
        repay_asset_id,
        pledge_days
    ) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("pledge_offer_take_create", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            debitor: debitor,
            pledge_amount: { amount: pledge_amount, asset_id: pledge_asset_id },
            credit_amount: { amount: credit_amount, asset_id: credit_asset_id },
            repay_amount: { amount: repay_amount, asset_id: repay_asset_id },
            pledge_days: pledge_days
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    pledge_offer_cancel(creator, pledge_offer) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("pledge_offer_cancel", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            creator: creator,
            pledge_offer: pledge_offer
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    pledge_offer_fill(
        account,
        debitor,
        creditor,
        pledge_amount,
        pledge_asset_id,
        credit_amount,
        credit_asset_id,
        repay_amount,
        repay_asset_id,
        pledge_days,
        pledge_offer
    ) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("pledge_offer_fill", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            account: account,
            debitor: debitor,
            creditor: creditor,
            pledge_amount: { amount: pledge_amount, asset_id: pledge_asset_id },
            credit_amount: { amount: credit_amount, asset_id: credit_asset_id },
            repay_amount: { amount: repay_amount, asset_id: repay_asset_id },
            pledge_days: pledge_days,
            pledge_offer: pledge_offer
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    pledge_offer_repay(
        debitor,
        creditor,
        repay_amount,
        repay_asset_id,
        pledge_amount,
        pledge_asset_id,
        pledge_offer
    ) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("pledge_offer_repay", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            debitor: debitor,
            creditor: creditor,
            repay_amount: { amount: repay_amount, asset_id: repay_asset_id },
            pledge_amount: { amount: pledge_amount, asset_id: pledge_asset_id },
            pledge_offer: pledge_offer
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    // POC VOTING
    pocVote(account, poc3_vote, poc6_vote, poc12_vote) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("poc_vote", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            account: account,
            poc3_vote: { amount: poc3_vote, asset_id: "1.3.0" },
            poc6_vote: { amount: poc6_vote, asset_id: "1.3.0" },
            poc12_vote: { amount: poc12_vote, asset_id: "1.3.0" }
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    // EXCHANHE SILVER
    exchangeSilver(account, amount) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("exchange_silver", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            account: account,
            amount: { amount: amount, asset_id: "1.3.4" }
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    // POC STAKING
    pocStak(account, amount, term) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("poc_stak", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            account: account,
            stak_amount: { amount: amount, asset_id: "1.3.0" },
            staking_type: term
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    proposePocStak(account, amount, term, proposal_account) {
        let trb = new TransactionBuilder();

        var tr = WalletApi.new_transaction();
        let pocStak = trb.get_type_operation("poc_stak", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            account: account,
            stak_amount: { amount: amount, asset_id: "1.3.0" },
            staking_type: term
        });
        let expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + 60 * 60 * 23);
        tr.add_type_operation("proposal_create", {
            proposed_ops: [{ op: pocStak }],
            expiration_time: expiration,
            fee_paying_account: proposal_account
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    // BUY GCWD
    buyGcwd(account, amount, term) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("buy_gcwd", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            account: account,
            amount: { amount: amount, asset_id: "1.3.0" }
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    // USER PROFILE
    changeReferrer(account_id, new_referrer) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("change_referrer", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            account_id: account_id,
            new_referrer: new_referrer
        });

        return WalletDb.process_transaction(tr, null, true);
    }

    // GREAT RACE
    grTeamCreate(captain, name, description, logo) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("gr_team_create", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            captain: captain,
            name: name,
            description: description,
            logo: logo
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    grInviteSend(captain, player, team) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("gr_invite_send", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            captain: captain,
            player: player,
            team: team
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    deleteTeam(captain, team) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("gr_team_delete", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            captain: captain,
            team: team
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    acceptInvitation(captain, player, team, invite) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("gr_invite_accept", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            captain: captain,
            player: player,
            team: team,
            invite: invite
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    removePlayer(captain, player, team) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("gr_player_remove", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            captain: captain,
            player: player,
            team: team
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    leaveTeam(captain, player, team) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("gr_team_leave", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            captain: captain,
            player: player,
            team: team
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    // GR BETS
    makeRangeBet(team, lower_rank, upper_rank, result, bettor, bet) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("gr_range_bet", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            team: team,
            lower_rank: lower_rank,
            upper_rank: upper_rank,
            result: result,
            bettor: bettor,
            bet: { amount: bet, asset_id: "1.3.0" }
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    makeTeamBet(team1, team2, winner, bettor, bet) {
        var tr = WalletApi.new_transaction();
        tr.add_type_operation("gr_team_bet", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            team1: team1,
            team2: team2,
            winner: winner,
            bettor: bettor,
            bet: { amount: bet, asset_id: "1.3.0" }
        });
        return WalletDb.process_transaction(tr, null, true);
    }

    addAccountContact(name) {
        return name;
    }

    removeAccountContact(name) {
        return name;
    }

    setPasswordAccount(account) {
        return account;
    }
}

export default alt.createActions(AccountActions);
