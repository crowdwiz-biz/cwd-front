import React from "react";
import {connect} from "alt-react";
import AccountStore from "stores/AccountStore";
import {ChainStore} from "bitsharesjs";
import FinanceHeader from "./components/FinanceHeader";
import FinanceBody from "./components/FinanceBody";

//STYLES
import "./scss/finance-dashboard.scss";

class FinanceDashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            account: this.props.account
        };
    }
    render() {
        if (this.props.account && this.state.account) {
            return (
                <section className="finance-dashboard__wrap">
                    <FinanceHeader
                        account={this.props.account}
                        history={this.props.history}
                    />
                    <FinanceBody
                        account={this.props.account}
                        history={this.props.history}
                    />
                </section>
            );
        } else if (!this.props.account && this.state.account) {
            return null;
        } else {
            this.props.history.push("/create-account/password");
        }
    }
}

export default FinanceDashboard = connect(FinanceDashboard, {
    listenTo() {
        return [AccountStore];
    },
    getProps() {
        if (AccountStore.getState().passwordAccount) {
            return {
                account: ChainStore.fetchFullAccount(
                    AccountStore.getState().currentAccount ||
                        AccountStore.getState().passwordAccount
                )
            };
        }
    }
});
