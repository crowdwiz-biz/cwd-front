import React from "react";
import Translate from "react-translate-component";
import { connect } from "alt-react";
import AccountStore from "stores/AccountStore";
import { ChainStore } from "bitsharesjs";
import TotalBalanceValue from "../../Utility/TotalBalanceValue";
import { List } from "immutable";
import NewIcon from "../../NewIcon/NewIcon";

//STYLES
import "../scss/user-block.scss";

// IMAGES
let start = require("assets/svg-images/svg-common/contracts-icons/start.svg");
let expert = require("assets/svg-images/svg-common/contracts-icons/expert.svg");
let citizen = require("assets/svg-images/svg-common/contracts-icons/citizen.svg");
let infinity = require("assets/svg-images/svg-common/contracts-icons/infinity.svg");
let client = require("assets/svg-images/svg-common/contracts-icons/client.svg");

class UserHeaderBlock extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            userContract: this.props.userContract
        };
    }

    _onNavigate(route, e) {
        e.preventDefault();
        this.props.history.push(route);
    }

    render() {
        let userContract;

        if (this.props.userContract == 0) {
            userContract = <img className="user-block__icon" src={client} />;
        }
        if (this.props.userContract == 1) {
            userContract = <img className="user-block__icon" src={start} />;
        }
        if (this.props.userContract == 2) {
            userContract = <img className="user-block__icon" src={expert} />;
        }
        if (this.props.userContract == 3) {
            userContract = <img className="user-block__icon" src={citizen} />;
        }
        if (this.props.userContract == 4) {
            userContract = <img className="user-block__icon" src={infinity} />;
        }

        let isAmbassador;
        let ambassadorsList = ChainStore.fetchFullAccount("ambassadors-list");

        if (this.props.account && ambassadorsList) {
            isAmbassador =
                ambassadorsList
                    .get("whitelisted_accounts")
                    .indexOf(this.props.account.get("id")) >= 0;
        }

        let walletBalance = this.props.currentAccount ? (
            <div className="user-block__balance-value">
                <TotalBalanceValue.AccountWrapper
                    accounts={List([this.props.currentAccount])}
                    noTip
                />
            </div>
        ) : null;

        let currentAccount = this.props.currentAccount;

        return (
            <div className="user-block__account-block"
                onClick={this._onNavigate.bind(
                    this,
                    `/profile/${currentAccount}`
                )}
            >
                <div className="truncated active-account">
                    <div className="user-block__account-inner">
                        {/* CONTRACT ICON */}
                        <div className="user-block__contract-wrap">
                            {userContract}
                        </div>

                        <div className="user-block__balance-wrap">
                            {/* NAME BLOCK */}
                            <div className="user-block__name-wrap text account-name">
                                {isAmbassador ?
                                    <NewIcon
                                        iconClass="user-block__ambassador-icon"
                                        iconWidth={14}
                                        iconHeight={11}
                                        iconName="ambassador-icon"
                                    />
                                : null}
                                <span className="user-block__name">
                                    {currentAccount}
                                </span>
                            </div>

                            {/* BALANCE BLOCK */}
                            {walletBalance}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default UserHeaderBlock = connect(UserHeaderBlock, {
    listenTo() {
        return [AccountStore];
    },
    getProps() {
        if (AccountStore.getState().passwordAccount) {
            return {
                currentAccount:
                    AccountStore.getState().currentAccount ||
                    AccountStore.getState().passwordAccount
            };
        }
    }
});
