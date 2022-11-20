import React from "react";
import Translate from "react-translate-component";
import counterpart from "counterpart";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";
import FormattedAsset from "../../Utility/FormattedAsset";
import { FormattedDate } from "react-intl";

//STYLES
import "../scss/pledge-form.scss";

class MyCurrentPledgeOffers extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            pledgeItem: this.props.pledgeItem,
            currentAccount: this.props.currentAccount
        };
        this.isWalletLocked = this.isWalletLocked.bind(this);
        this.payOffPledgeOffer = this.payOffPledgeOffer.bind(this);
    }

    componentDidUpdate(nextProps) {
        const { pledgeItem } = this.props;
        if (nextProps.pledgeItem !== pledgeItem) {
            if (pledgeItem) {
                this.setState({ pledgeItem: nextProps.pledgeItem });
            }
        }
    }

    isWalletLocked(
        debitor,
        creditor,
        repay_amount,
        repay_asset_id,
        pledge_amount,
        pledge_asset_id,
        pledge_offer,
        e
    ) {
        e.preventDefault();
        if (this.state.currentAccount) {
            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();
                        this.payOffPledgeOffer(
                            debitor,
                            creditor,
                            repay_amount,
                            repay_asset_id,
                            pledge_amount,
                            pledge_asset_id,
                            pledge_offer
                        );
                    })
                    .catch(() => { });
            } else {
                this.payOffPledgeOffer(
                    debitor,
                    creditor,
                    repay_amount,
                    repay_asset_id,
                    pledge_amount,
                    pledge_asset_id,
                    pledge_offer
                );
            }
        }
    }

    payOffPledgeOffer(
        debitor,
        creditor,
        repay_amount,
        repay_asset_id,
        pledge_amount,
        pledge_asset_id,
        pledge_offer
    ) {
        AccountActions.pledge_offer_repay(
            debitor,
            creditor,
            repay_amount,
            repay_asset_id,
            pledge_amount,
            pledge_asset_id,
            pledge_offer
        );
    }

    render() {
        let pledgeItem = this.state.pledgeItem;
        let pledgeType = this.state.currentAccount == pledgeItem["debitor"];

        let pledgeTypeHeader = pledgeType
            ? counterpart.translate("crowd_pledge.exchange.type_take_header")
            : counterpart.translate("crowd_pledge.exchange.type_give_header");

        return (
            <li className="pledge-offer__item pledge-offer__item--static">
                {/* PLEDGE ID  */}
                <span className="pledge-offer__item-id">
                    #{pledgeItem["id"]}
                </span>

                <div className="pledge-offer__wrap">
                    <div className="pledge-offer__inner">
                        <span className="pledge-offer__name">
                            {pledgeTypeHeader}
                        </span>

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

                        <div className="pledge-offer__row">
                            <Translate
                                className="pledge-offer__text"
                                content="crowd_pledge.expiration_date"
                            />
                            <span className="pledge-offer__text pledge-offer__text--data">
                                <FormattedDate
                                    value={pledgeItem["expiration"]}
                                    format="full"
                                />
                                {" (GMT)"}
                            </span>
                        </div>
                    </div>
                    {pledgeType ? (
                        <button
                            className="pledge-common__btn"
                            type="button"
                            onClick={this.isWalletLocked.bind(
                                this,
                                pledgeItem["debitor"],
                                pledgeItem["creditor"],
                                pledgeItem["repay_amount"].amount,
                                pledgeItem["repay_amount"].asset_id,
                                pledgeItem["pledge_amount"].amount,
                                pledgeItem["pledge_amount"].asset_id,
                                pledgeItem["id"]
                            )}
                        >
                            <Translate content="crowd_pledge.pay_off_btn" />
                        </button>
                    ) : null}
                </div>
            </li>
        );
    }
}

export default MyCurrentPledgeOffers;
