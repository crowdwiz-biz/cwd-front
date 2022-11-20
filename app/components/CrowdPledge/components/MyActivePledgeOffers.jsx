import React from "react";
import Translate from "react-translate-component";
import counterpart from "counterpart";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";
import FormattedAsset from "../../Utility/FormattedAsset";

//STYLES
import "../scss/pledge-form.scss";

class MyActivePledgeOffers extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            pledgeItem: this.props.pledgeItem,
            currentAccount: this.props.currentAccount
        };
        this.isWalletLocked = this.isWalletLocked.bind(this);
        this.deletePledgeOffer = this.deletePledgeOffer.bind(this);
    }

    componentDidUpdate(nextProps) {
        const { pledgeItem } = this.props;
        if (nextProps.pledgeItem !== pledgeItem) {
            if (pledgeItem) {
                this.setState({ pledgeItem: nextProps.pledgeItem });
            }
        }
    }

    isWalletLocked(pledgeItem, e) {
        e.preventDefault();
        if (this.state.currentAccount) {
            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();
                        this.deletePledgeOffer(
                            this.state.currentAccount,
                            pledgeItem
                        );
                    })
                    .catch(() => { });
            } else {
                this.deletePledgeOffer(this.state.currentAccount, pledgeItem);
            }
        }
    }

    deletePledgeOffer(currentAccount, pledgeItem) {
        AccountActions.pledge_offer_cancel(currentAccount, pledgeItem);
    }

    render() {
        let pledgeItem = this.state.pledgeItem;

        let pledgeType =
            pledgeItem["debitor"] == "1.2.0"
                ? counterpart.translate("crowd_pledge.exchange.type_give")
                : counterpart.translate("crowd_pledge.exchange.type_take");

        return (
            <li className="pledge-offer__item">
                {/* PLEDGE ID  */}
                <span className="pledge-offer__item-id">
                    #{pledgeItem["id"]}
                </span>

                <div className="pledge-offer__wrap">
                    <div className="pledge-offer__inner">
                        <span className="pledge-offer__name">{pledgeType}</span>

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

                    <button
                        className="pledge-common__btn"
                        type="button"
                        onClick={this.isWalletLocked.bind(
                            this,
                            pledgeItem["id"]
                        )}
                    >
                        <Translate content="crowd_pledge.delete_btn" />
                    </button>
                </div>
            </li>
        );
    }
}

export default MyActivePledgeOffers;
