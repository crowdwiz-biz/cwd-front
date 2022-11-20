import React from "react";
import Translate from "react-translate-component";
import { Apis } from "bitsharesjs-ws";
import AccountActions from "actions/AccountActions";
import VestingTypes from "./components/VestingTypes";
import TranslateWithLinks from "../../Utility/TranslateWithLinks";


require("./scss/vesting.scss");

class AccountVesting extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            vbs: null,
            showClipboardMsg: false,
            currentAccount: null,
            silverBalance: 0
        };
    }
    componentDidMount() {
        if (this.props.account) {
            let balance_id = this.props.account.getIn(["balances", "1.3.4"]);
            let userName = this.props.account.get("name");

            this.setState({
                currentAccount: userName
            });
            if (balance_id) {
                Apis.instance()
                    .db_api()
                    .exec("get_objects", [[balance_id]])
                    .then(data => {
                        this.setState({
                            silverBalance: data[0]["balance"] / 100000
                        });
                    });
            }
        } else {
            this.props.history.push("/create-account/password");
        }
    }

    UNSAFE_componentWillMount() {
        this.retrieveVestingBalances.call(this, this.props.account.get("id"));
    }

    UNSAFE_componentWillUpdate(nextProps) {
        let newId = nextProps.account.get("id");
        let oldId = this.props.account.get("id");

        if (newId !== oldId) {
            this.retrieveVestingBalances.call(this, newId);
        }
    }

    retrieveVestingBalances(accountId) {
        accountId = accountId || this.props.account.get("id");
        Apis.instance()
            .db_api()
            .exec("get_vesting_balances", [accountId])
            .then(vbs => {
                this.setState({ vbs });
            })
            .catch(err => {
                console.log("error:", err);
            });
    }

    upgradeStatusAccount(id, statusType, e) {
        e.preventDefault();
        AccountActions.upgradeStatusAccount(id, statusType);
    }

    async selectValue(ref) {
        try {
            await navigator.clipboard.writeText(ref);
            this.setState({ ["showClipboardMsg"]: true });
            setTimeout(() => {
                this.setState({ ["showClipboardMsg"]: false });
            }, 2000);
        } catch (err) {
            console.log(err, "text is not copied to clipboard");
        }
    }

    render() {
        let { vbs } = this.state;
        if (
            !vbs ||
            !this.props.account ||
            !this.props.account.get("vesting_balances")
        ) {
            return null;
        }

        let account_name = this.props.account.get("name");

        let total_vesting_amount = 0;

        vbs.map(vb => (total_vesting_amount += vb["balance"]["amount"]));

        let silverBalance = this.state.silverBalance.toString();

        let url_string = window.location.href;
        let url = new URL(url_string);
        let activeTab = parseInt(url.searchParams.get("activeTab"));

        return (
            <div ref="appTables">
                <Translate
                    className="cwd-common__title"
                    content="account.vesting.vesting_title"
                />

                {/*Vesting items*/}
                <div className="contract__vesting-wrap">
                    {!vbs.length || total_vesting_amount == 0 ? (
                        <p className="contract__info-text">
                            <TranslateWithLinks
                                string="account.vesting.no_balances"
                                keys={[
                                    {
                                        type: "account",
                                        value: account_name,
                                        arg: "account"
                                    }
                                ]}
                            />
                        </p>
                    ) : (
                        <div>
                            <div className="vesting__container">
                                <VestingTypes
                                    account={this.props.account}
                                    vestingObj={vbs}
                                    retrieveVestingBalances={this.retrieveVestingBalances.bind(
                                        this
                                    )}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default AccountVesting;
