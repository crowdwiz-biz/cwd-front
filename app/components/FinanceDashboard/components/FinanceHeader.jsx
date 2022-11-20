import React from "react";
import Translate from "react-translate-component";
import NewIcon from "../../NewIcon/NewIcon";
import {Link} from "react-router-dom";
import Transfer from "../../Modal/Transfer";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";
import {ChainStore} from "bitsharesjs";
import TotalBalanceValue from "../../Utility/TotalBalanceValue";
import {List} from "immutable";

//STYLES
import "../scss/finance-header.scss";

class FinanceHeader extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            account: this.props.account,
            intervalID: 0
        };
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalID);
    }

    _showSend = e => {
        e.preventDefault();

        let isScam = false;
        let scamAccounts = ChainStore.fetchFullAccount("scam-accounts");

        if (this.props.account && scamAccounts) {
            isScam =
                scamAccounts
                    .get("blacklisted_accounts")
                    .indexOf(this.props.account.get("id")) >= 0;

            if (!isScam) {
                if (WalletDb.isLocked()) {
                    WalletUnlockActions.unlock()
                        .then(() => {
                            AccountActions.tryToSetCurrentAccount();
                            if (this.send_modal) this.send_modal.show();
                        })
                        .catch(() => {});
                } else {
                    if (this.send_modal) this.send_modal.show();
                }
            } else {
                this.props.history.push("/");
            }
        }
    };

    render() {
        let account_name = this.props.account.get("name");
        let width = window.innerWidth;

        return (
            <header>
                <div className="finance-header">
                    <div className="finance-header__transfer-wrap">
                        <button
                            className="finance-header__transfer-btn cwd-btn__rounded"
                            type="button"
                            onClick={this._showSend.bind(this)}
                        >
                            <NewIcon
                                iconWidth={width > 576 ? 39 : 31}
                                iconHeight={width > 576 ? 24 : 19}
                                iconName={"finance-dashboard_btn_icon_transfer"}
                            />

                            {width > 576 ? (
                                <Translate content="finance_dashboard.send_assets" />
                            ) : (
                                <Translate content="finance_dashboard.send_assets_mobile" />
                            )}
                        </button>
                    </div>
                    <div className="finance-header__balance-wrap">
                        <Translate
                            className="finance-header__balance-text"
                            content="finance_dashboard.cwd_amount"
                        />
                        <span className="finance-header__balance-amount">
                            <TotalBalanceValue.AccountWrapper
                                accounts={List([account_name])}
                                noTip
                            />
                        </span>
                    </div>

                    <div className="finance-dashboard__btn-wrap">
                        <Link
                            to={`/account/${account_name}/portfolio`}
                            className="finance-dashboard__btn finance-dashboard__btn--portfolio"
                        >
                            {width > 576 ? (
                                <Translate content="finance_dashboard.porfolio_link" />
                            ) : (
                                <Translate content="finance_dashboard.porfolio_link_mobile" />
                            )}

                            <NewIcon
                                iconWidth={width > 576 ? 16 : 9}
                                iconHeight={width > 576 ? 13 : 7}
                                iconName={"link_btn_arrow"}
                            />
                        </Link>
                    </div>
                </div>

                <Transfer
                    id="send_modal_header"
                    refCallback={e => {
                        if (e) this.send_modal = e;
                    }}
                    from_name={this.props.account.get("name")}
                />
            </header>
        );
    }
}

export default FinanceHeader;
