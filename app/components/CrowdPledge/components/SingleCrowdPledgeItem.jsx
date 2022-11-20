import React from "react";
import Translate from "react-translate-component";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";
import LinkToAccountById from "../../Utility/LinkToAccountById";
import FormattedAsset from "../../Utility/FormattedAsset";
import { Apis } from "bitsharesjs-ws";
import AccountStore from "stores/AccountStore";
import { ChainStore } from "bitsharesjs";
import { connect } from "alt-react";
import { Link } from "react-router-dom";
import NewIcon from "../../NewIcon/NewIcon";


//STYLES
import "../scss/pledge-common.scss";
import "../scss/pledge-offer.scss";

class SingleCrowdPledgeItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            singleTrade: [],
            currentAccount: this.props.currentAccount
        };
    }

    componentWillMount() {
        let url = window.location.pathname;
        let itemId = url.split("item-")[1].toString();

        Apis.instance()
            .db_api()
            .exec("get_objects", [["1.23." + itemId]])
            .then(pledgeOffer => {
                this.setState({
                    singleTrade: pledgeOffer[0]
                });
            });
        ;
    }

    givePledgeOffer(
        account,
        creditor,
        pledge_amount,
        pledge_asset_id,
        credit_amount,
        credit_asset_id,
        repay_amount,
        repay_asset_id,
        pledge_days,
        pledge_offer,
        e
    ) {
        e.preventDefault();

        if (this.state.currentAccount) {
            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();
                        AccountActions.pledge_offer_fill(
                            account,
                            account,
                            creditor,
                            pledge_amount,
                            pledge_asset_id,
                            credit_amount,
                            credit_asset_id,
                            repay_amount,
                            repay_asset_id,
                            pledge_days,
                            pledge_offer
                        );
                    })
                    .catch(() => { });
            } else {
                AccountActions.pledge_offer_fill(
                    account,
                    account,
                    creditor,
                    pledge_amount,
                    pledge_asset_id,
                    credit_amount,
                    credit_asset_id,
                    repay_amount,
                    repay_asset_id,
                    pledge_days,
                    pledge_offer
                );
            }
        }
    }

    takePledgeOffer(
        account,
        debitor,
        pledge_amount,
        pledge_asset_id,
        credit_amount,
        credit_asset_id,
        repay_amount,
        repay_asset_id,
        pledge_days,
        pledge_offer,
        e
    ) {
        e.preventDefault();

        if (this.state.currentAccount) {
            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();
                        AccountActions.pledge_offer_fill(
                            account,
                            debitor,
                            account,
                            pledge_amount,
                            pledge_asset_id,
                            credit_amount,
                            credit_asset_id,
                            repay_amount,
                            repay_asset_id,
                            pledge_days,
                            pledge_offer
                        );
                    })
                    .catch(() => { });
            } else {
                AccountActions.pledge_offer_fill(
                    account,
                    debitor,
                    account,
                    pledge_amount,
                    pledge_asset_id,
                    credit_amount,
                    credit_asset_id,
                    repay_amount,
                    repay_asset_id,
                    pledge_days,
                    pledge_offer
                );
            }
        }
    }


    copyToBuffer() {
        this.setState({
            showClipboardAlert: true
        });

        this.timer = setTimeout(() => {
            this.setState({ showClipboardAlert: false });
        }, 2000);

        var copyText = window.location.href;

        navigator.clipboard.writeText(copyText);
    }

    render() {
        let pledgeItem = this.state.singleTrade;

        if (Object.keys(pledgeItem).length === 0) {
            return (null);
        } else {
            let pledgeType;

            if (pledgeItem.creditor == "1.2.0") {
                pledgeType = true
            } else {
                pledgeType = false
            }

            return (

                <section className="cwd-common__wrap">
                    <Link to="/pledge-offer" className="pledge-common__back-link">
                        <Translate
                            content="cwdgateway.go_to_dexlist"
                        />
                    </Link>

                    <div className="pledge-offer__item pledge-offer__item--static">
                        {/* PLEDGE ID  */}
                        <span className="pledge-offer__item-id">
                            #{pledgeItem["id"]}
                        </span>

                        <div className="pledge-offer__wrap">
                            <div className="pledge-offer__inner">
                                <div className="pledge-offer__row">
                                    <Translate
                                        className="pledge-offer__text"
                                        content="crowd_pledge.pledge_amount"
                                    />
                                    <span className="pledge-offer__text pledge-offer__text--data pledge-offer__text--price">
                                        <FormattedAsset
                                            amount={pledgeItem["pledge_amount"].amount}
                                            asset={pledgeItem["pledge_amount"].asset_id}
                                            decimalOffset={5}
                                        />
                                    </span>
                                </div>

                                <div className="pledge-offer__row">
                                    <Translate
                                        className="pledge-offer__text"
                                        content="crowd_pledge.credit_amount"
                                    />
                                    <span className="pledge-offer__text pledge-offer__text--data pledge-offer__text--price">
                                        <FormattedAsset
                                            amount={pledgeItem["credit_amount"].amount}
                                            asset={pledgeItem["credit_amount"].asset_id}
                                            decimalOffset={5}
                                        />
                                    </span>
                                </div>

                                <div className="pledge-offer__row">
                                    <Translate
                                        className="pledge-offer__text"
                                        content="crowd_pledge.repay_amount"
                                    />
                                    <span className="pledge-offer__text pledge-offer__text--data pledge-offer__text--price">
                                        <FormattedAsset
                                            amount={pledgeItem["repay_amount"].amount}
                                            asset={pledgeItem["repay_amount"].asset_id}
                                            decimalOffset={5}
                                        />
                                    </span>
                                </div>

                                <div className="pledge-offer__row">
                                    <Translate
                                        className="pledge-offer__text"
                                        content="crowd_pledge.time_limit"
                                    />
                                    <span className="pledge-offer__text pledge-offer__text--data">
                                        {pledgeItem["pledge_days"]}
                                        <Translate
                                            className="pledge-offer__text pledge-offer__text--days"
                                            content="crowd_pledge.repay_days"
                                        />
                                    </span>
                                </div>
                            </div>

                            <div>
                                <div className="pledge-offer__p2p-info-wrap">
                                    <div className="pledge-offer__row">
                                        <Translate
                                            className="pledge-offer__text"
                                            content="crowd_pledge.exchange.trader"
                                        />
                                        <span className="pledge-offer__text pledge-offer__text--data">
                                            <LinkToAccountById
                                                account={pledgeItem["creator"]}
                                            />
                                        </span>
                                    </div>
                                </div>

                                {pledgeType ?
                                    <button
                                        className="pledge-common__btn"
                                        type="button"
                                        onClick={this.takePledgeOffer.bind(
                                            this,
                                            this.state.currentAccount.get("id"),
                                            pledgeItem["debitor"],
                                            pledgeItem["pledge_amount"].amount,
                                            pledgeItem["pledge_amount"].asset_id,
                                            pledgeItem["credit_amount"].amount,
                                            pledgeItem["credit_amount"].asset_id,
                                            pledgeItem["repay_amount"].amount,
                                            pledgeItem["repay_amount"].asset_id,
                                            pledgeItem["pledge_days"],
                                            pledgeItem["id"]
                                        )}
                                        disabled={
                                            this.state.currentAccount ==
                                            pledgeItem["creator"]
                                        }
                                    >
                                        <Translate content="crowd_pledge.ads.take_pledge" />
                                    </button>
                                    :
                                    <button
                                        className="pledge-common__btn"
                                        type="button"
                                        onClick={this.givePledgeOffer.bind(
                                            this,
                                            this.state.currentAccount.get("id"),
                                            pledgeItem["creditor"],
                                            pledgeItem["pledge_amount"].amount,
                                            pledgeItem["pledge_amount"].asset_id,
                                            pledgeItem["credit_amount"].amount,
                                            pledgeItem["credit_amount"].asset_id,
                                            pledgeItem["repay_amount"].amount,
                                            pledgeItem["repay_amount"].asset_id,
                                            pledgeItem["pledge_days"],
                                            pledgeItem["id"]
                                        )}
                                        disabled={
                                            this.state.currentAccount ==
                                            pledgeItem["creator"]
                                        }
                                    >
                                        <Translate content="crowd_pledge.ads.give_pledge" />
                                    </button>}

                                <div
                                    className="pledge-common__copy-btn"
                                    onClick={this.copyToBuffer.bind(this)}
                                >
                                    <Translate content="cwdgateway.copy_btn" />
                                    <NewIcon
                                        iconWidth={20}
                                        iconHeight={20}
                                        iconName={"icon_copy"}
                                    />
                                </div>
                                {this.state.showClipboardAlert ? (
                                    <Translate
                                        className="pledge-common__alert"
                                        content="actions.alerts.copy_text" />
                                ) : null}
                            </div>
                        </div>
                    </div>
                </section>
            );
        }
    }
}

export default SingleCrowdPledgeItem = connect(SingleCrowdPledgeItem, {
    listenTo() {
        return [AccountStore];
    },
    getProps() {
        if (AccountStore.getState().passwordAccount) {
            return {
                currentAccount: ChainStore.fetchFullAccount(
                    AccountStore.getState().passwordAccount
                )
            };
        }
    }
});
