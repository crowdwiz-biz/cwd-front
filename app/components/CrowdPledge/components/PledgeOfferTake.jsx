import React from "react";
import Translate from "react-translate-component";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";
import LinkToAccountById from "../../Utility/LinkToAccountById";
import FormattedAsset from "../../Utility/FormattedAsset";

//STYLES
import "../scss/pledge-offer.scss";

class PledgeOfferTake extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            takeOffers: this.props.takeOffers,
            currentAccount: this.props.currentAccount
        };
        this.isWalletLocked = this.isWalletLocked.bind(this);
        this.givePledgeOffer = this.givePledgeOffer.bind(this);
    }

    isWalletLocked(
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
                        this.givePledgeOffer(
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
                this.givePledgeOffer(
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
        pledge_offer
    ) {
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

    onNavigate(item, e) {
        e.preventDefault();

        let itemId = item;
        let idSplit = itemId.split(".");
        let urlId = idSplit[2];

        this.props.history.push(`/pledge-offer/item-${urlId}`);
    };

    render() {
        let pledgeItem = this.state.takeOffers;

        return (
            <li className="pledge-offer__item">
                {/* PLEDGE ID  */}
                <span 
                className="pledge-offer__item-id"
                    onClick={this.onNavigate.bind(
                        this,
                        pledgeItem["id"]
                    )}>
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

                        <button
                            className="pledge-common__btn"
                            type="button"
                            onClick={this.isWalletLocked.bind(
                                this,
                                this.state.currentAccount,
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
                        </button>
                    </div>
                </div>
            </li>
        );
    }
}

export default PledgeOfferTake;
