import React from "react";
import Translate from "react-translate-component";
import FormattedAsset from "../../../Utility/FormattedAsset";
import {ChainStore} from "bitsharesjs";
import AccountStore from "stores/AccountStore";
import utils from "common/utils";
import WalletActions from "actions/WalletActions";
import {FormattedDate} from "react-intl";
import {Apis} from "bitsharesjs-ws";

class VestingBalance extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dynGlobalObject: null
        };
    }

    componentDidMount() {
        Apis.instance()
            .db_api()
            .exec("get_objects", [["2.1.0"]])
            .then(date => {
                this.setState({
                    dynGlobalObject: date
                });
            });
    }

    onClaim(claimAll, e) {
        e.preventDefault();

        WalletActions.claimVestingBalance(
            this.props.account.get("id"),
            this.props.vb,
            claimAll
        ).then(() => {
            typeof this.props.handleChanged == "function" &&
                this.props.handleChanged();
        });
    }

    onProposalClaim(claimAll, proposal_account, e) {
        e.preventDefault();

        WalletActions.proposeClaimVestingBalance(
            this.props.account.get("id"),
            this.props.vb,
            claimAll,
            proposal_account
        ).then(() => {
            typeof this.props.handleChanged == "function" &&
                this.props.handleChanged();
        });
    }

    render() {
        let {vb} = this.props;
        let width = window.innerWidth;
        const tablet = 769;

        if (!this.props.vb) {
            return null;
        }

        let begin_timestampDate = new Date(0);
        let currentTimeDate = new Date("now");

        let cvbAsset, vestingPeriod, earned, availablePercent, balance;
        if (vb) {
            if (vb.policy[0] == 1) {
                balance = vb.balance.amount;
                cvbAsset = ChainStore.getAsset(vb.balance.asset_id);
                earned = vb.policy[1].coin_seconds_earned;
                vestingPeriod = vb.policy[1].vesting_seconds;
                availablePercent =
                    vestingPeriod === 0
                        ? 1
                        : earned / (vestingPeriod * balance);
            } else {
                let dynGlobalObject = ChainStore.getObject("2.1.0");

                balance = vb.balance.amount;
                cvbAsset = ChainStore.getAsset(vb.balance.asset_id);
                let begin_timestamp = vb.policy[1].begin_timestamp;
                if (!/Z$/.test(begin_timestamp)) {
                    begin_timestamp += "Z";
                }
                begin_timestampDate = new Date(begin_timestamp);
                if (dynGlobalObject) {
                    let block_time = dynGlobalObject.get("time");
                    if (!/Z$/.test(block_time)) {
                        block_time += "Z";
                    }
                    currentTimeDate = new Date(block_time);
                    if (currentTimeDate > begin_timestampDate) {
                        let vesting_duration_seconds =
                            vb.policy[1].vesting_duration_seconds;
                        let current_delta =
                            (currentTimeDate - begin_timestampDate) / 1000;
                        if (
                            vesting_duration_seconds === 0 ||
                            vesting_duration_seconds <= current_delta
                        ) {
                            availablePercent = 1;
                        } else {
                            availablePercent =
                                current_delta / vesting_duration_seconds;
                        }
                    } else {
                        availablePercent = 0;
                    }
                }
            }
        }

        if (!cvbAsset) {
            return null;
        }

        if (!balance) {
            return null;
        }

        let vestingClass;
        if (cvbAsset.get("id") == "1.3.0") {
            vestingClass = "vesting";
        } else {
            vestingClass = "vesting vesting--silver";
        }
        let vestingAccount = this.props.account.get("id");
        let currentAccount;

        if (
            ChainStore.fetchFullAccount(AccountStore.getState().passwordAccount)
        ) {
            let currentAccountObj = ChainStore.fetchFullAccount(
                AccountStore.getState().passwordAccount
            );
            currentAccount = currentAccountObj.get("id");
        } else {
            currentAccount = null;
        }

        return (
            <div
                className={
                    !this.props.notAvailable ||
                    (vb.policy[1].vesting_duration_seconds == 0 &&
                        vb.policy[0] == 0 &&
                        currentTimeDate > begin_timestampDate)
                        ? vestingClass
                        : " vesting vesting--not-available"
                }
            >
                {/* balance id, 1st col */}
                <div className="vesting__id">
                    <div>{vb.id}</div>
                </div>

                {/* total deposit amount, 2nd col */}
                <div className="vesting__amount-outer">
                    <div className="vesting__amount-wrapper">
                        {width < tablet && (
                            <Translate
                                component="div"
                                content="account.vesting.total-deposit"
                                className="vesting__title"
                            />
                        )}
                        {vb.policy[0] == 0 ? (
                            <div>
                                {isNaN(availablePercent) ? (
                                    "N/A"
                                ) : (
                                    <div className="vesting__amount">
                                        <FormattedAsset
                                            amount={vb.balance.amount}
                                            asset={cvbAsset.get("id")}
                                            decimalOffset={vb.balance.amount > 10000000000 ? 3 : 5}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="vesting__amount">
                                <FormattedAsset
                                    amount={0}
                                    asset={cvbAsset.get("id")}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* will be available after date  */}
                {vb.policy[1].vesting_duration_seconds == 0 &&
                vb.policy[0] == 0 &&
                currentTimeDate < begin_timestampDate ? (
                    <div className="vesting__after-date">
                        <Translate
                            component="div"
                            content="account.vesting.available-date"
                        />
                        <div>
                            <FormattedDate
                                value={vb.policy[1].begin_timestamp}
                                format="full"
                                timeZoneName="short"
                            />
                        </div>
                    </div>
                ) : null}

                {/* available to claim (amount and percentage), 3rd col */}
                {!this.props.notAvailable && (
                    <div className="vesting__claim">
                        {width < tablet && (
                            <Translate
                                component="div"
                                content="account.vesting.available"
                                className="vesting__title"
                            />
                        )}
                        {isNaN(availablePercent) ? (
                            "N/A"
                        ) : (
                            <div className="vesting__available-amount">
                                <span className="vesting__percentage">
                                    {utils.format_number(
                                        availablePercent * 100,
                                        2
                                    )}
                                    %{" "}
                                </span>
                                {vb.policy[0] == 0 ? (
                                    <FormattedAsset
                                        amount={
                                            availablePercent *
                                                vb.policy[1].begin_balance -
                                            (vb.policy[1].begin_balance -
                                                vb.balance.amount)
                                        }
                                        asset={cvbAsset.get("id")}
                                    />
                                ) : (
                                    <FormattedAsset
                                        amount={
                                            availablePercent * vb.balance.amount
                                        }
                                        asset={cvbAsset.get("id")}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* withdrawed, 4th col */}
                {!this.props.notAvailable && (
                    <div className="vesting__withdrawed-wrapper">
                        <div className="vesting__withdrawed-inner">
                            {width < tablet && (
                                <Translate
                                    component="div"
                                    content="account.vesting.withdrawed"
                                    className="vesting__title"
                                />
                            )}
                            {vb.policy[1].begin_balance - vb.balance.amount >
                            0 ? (
                                <div className="vesting__withdrawed">
                                    <FormattedAsset
                                        amount={
                                            vb.policy[1].begin_balance -
                                            vb.balance.amount
                                        }
                                        asset={cvbAsset.get("id")}
                                    />
                                </div>
                            ) : (
                                <div className="vesting__withdrawed-amount">
                                    <div className="vesting__withdrawed">
                                        <FormattedAsset
                                            amount={0}
                                            asset={cvbAsset.get("id")}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {vb.policy[1].vesting_duration_seconds == 0 &&
                vb.policy[0] == 0 &&
                currentTimeDate > begin_timestampDate ? (
                    <div></div>
                ) : null}

                {vb.policy[1].vesting_duration_seconds == 0 &&
                vb.policy[0] == 0 &&
                currentTimeDate > begin_timestampDate ? (
                    <div></div>
                ) : null}

                {/*  button, 5th col */}
                {!this.props.notAvailable ||
                (vb.policy[1].vesting_duration_seconds == 0 &&
                    vb.policy[0] == 0 &&
                    currentTimeDate > begin_timestampDate) ? (
                    <button
                        onClick={
                            vestingAccount == currentAccount
                                ? this.onClaim.bind(this, false)
                                : this.onProposalClaim.bind(
                                      this,
                                      false,
                                      currentAccount
                                  )
                        }
                        className="vesting__btn"
                    >
                        <Translate content="account.vesting.claim" />
                    </button>
                ) : null}
            </div>
        );
    }
}

export default VestingBalance;
