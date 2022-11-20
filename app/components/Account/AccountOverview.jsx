import React from "react";
import Immutable from "immutable";
import Translate from "react-translate-component";
import { RecentTransactions } from "./RecentTransactions";
import utils from "common/utils";
import BalanceWrapper from "./BalanceWrapper";
import AssetWrapper from "../Utility/AssetWrapper";
import ls from "common/localStorage";
import AccountStore from "stores/AccountStore";
import Proposals from "components/Account/Proposals";
import { Tabs, Tab } from "../Utility/Tabs";
import Switch from "react-switch";
import NewIcon from "../NewIcon/NewIcon";


let accountStorage = new ls("__graphene__");

class AccountOverview extends React.Component {
    constructor(props) {
        super();
        this.state = {
            currentAccount: accountStorage.get("passwordAccount"),
            hideFishingProposals: true
        };

        this._handleFilterInput = this._handleFilterInput.bind(this);
    }

    _handleFilterInput(e) {
        e.preventDefault();
        this.setState({
            filterValue: e.target.value
        });
    }

    _toggleHideProposal() {
        this.setState({
            hideFishingProposals: !this.state.hideFishingProposals
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            !utils.are_equal_shallow(nextProps.balances, this.props.balances) ||
            nextProps.account !== this.props.account ||
            nextProps.isMyAccount !== this.props.isMyAccount ||
            nextProps.settings !== this.props.settings ||
            nextProps.hiddenAssets !== this.props.hiddenAssets ||
            !utils.are_equal_shallow(nextState, this.state) ||
            this.state.filterValue !== nextState.filterValue
        );
    }

    render() {
        let { account } = this.props;

        if (!account) {
            return null;
        }

        let accountsList = Immutable.fromJS([account.get("id")]);
        let currentAccount = this.props.currentAccount;
        let passAccount = AccountStore.getState().passwordAccount;

        return (
            <div>
                {account.get("proposals") && account.get("proposals").size ? (
                    <Tabs
                        className="cwd-tabs"
                        tabsClass="cwd-tabs__list"
                        contentClass="cwd-tabs__content"
                        segmented={false}
                        actionButtons={false}
                    >
                        <Tab title="account.op_history">
                            <RecentTransactions
                                accountsList={accountsList}
                                compactView={false}
                                showMore={true}
                                fullHeight={true}
                                limit={100}
                                showFilters={true}
                                dashboard
                                shortMode={false}
                            />
                        </Tab>

                        <Tab
                            title="explorer.proposals.title"
                            subText={String(
                                account.get("proposals")
                                    ? account.get("proposals").size
                                    : 0
                            )}
                        >
                            <div
                                onClick={this._toggleHideProposal.bind(this)}
                                className="proposals-switch__wrap"
                            >
                                <Switch
                                    className="proposals-switch__btn"
                                    onChange={this.handleChange}
                                    checked={this.state.hideFishingProposals}
                                    offColor={"#6d6d6d"}
                                    onColor={"#141414"}
                                    onHandleColor={"#DEC27F"}
                                    checkedIcon={false}
                                    uncheckedIcon={false}
                                    height={20}
                                    width={36}
                                    borderRadius={20}
                                    checkedHandleIcon={
                                        <NewIcon
                                            iconWidth={12}
                                            iconHeight={8}
                                            iconName={"checkmark"}
                                        />
                                    }
                                    onChange={this._toggleHideProposal.bind(this)}
                                />

                                <Translate
                                    className="proposals-switch__text"
                                    content="account.deactivate_suspicious_proposals" />
                            </div>

                            <Proposals
                                account={account}
                                hideFishingProposals={
                                    this.state.hideFishingProposals
                                }
                            />
                        </Tab>
                    </Tabs>
                ) : (
                    <div>
                        <Translate
                            content="account.op_history"
                            className="cwd-common__title"
                        />

                        <RecentTransactions
                            accountsList={accountsList}
                            compactView={false}
                            showMore={true}
                            fullHeight={true}
                            limit={100}
                            showFilters={true}
                            dashboard
                            shortMode={false}
                        />
                    </div>
                )}
            </div>
        );
    }
}

AccountOverview = AssetWrapper(AccountOverview, { propNames: ["core_asset"] });

export default class AccountOverviewWrapper extends React.Component {
    render() {
        return <BalanceWrapper {...this.props} wrap={AccountOverview} />;
    }
}
