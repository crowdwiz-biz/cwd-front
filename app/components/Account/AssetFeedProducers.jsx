import React from "react";
import AccountSelector from "../Account/AccountSelector";
import LinkToAccountById from "../Utility/LinkToAccountById";
import Translate from "react-translate-component";
import NewIcon from "../NewIcon/NewIcon";

export default class AccountFeedProducers extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            producer_name: null
        };
    }

    onAccountChanged(account) {
        this.setState({
            new_producer_id: account ? account.get("id") : null
        });
    }

    onAccountNameChanged(name) {
        this.setState({
            producer_name: name
        });
    }

    render() {
        const {witnessFed, committeeFed} = this.props;

        if (witnessFed || committeeFed) {
            return (
                <div className="grid-content small-12 large-8 large-offset-2">
                    <Translate
                        component="p"
                        content="account.user_issued_assets.feed_not_allowed_1"
                        className="has-error"
                    />
                    <Translate
                        component="p"
                        content="account.user_issued_assets.feed_not_allowed_2"
                    />
                </div>
            );
        }

        return (
            <div className="grid-content small-12 large-8 large-offset-2">
                <table className="table dashboard-table table-hover">
                    <thead>
                        <tr>
                            <th />
                            <th style={{textAlign: "left"}}>
                                <Translate content="explorer.account.title" />
                            </th>
                            <th>
                                <Translate content="account.perm.remove_text" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.producers.map((a, i) => {
                            return (
                                <tr key={a}>
                                    <td style={{textAlign: "left"}}>
                                        #{i + 1}
                                    </td>
                                    <td style={{textAlign: "left"}}>
                                        <LinkToAccountById account={a} />
                                    </td>
                                    <td
                                        className="clickable"
                                        onClick={this.props.onChangeList.bind(
                                            this,
                                            "remove",
                                            a
                                        )}
                                    >
                                        <NewIcon
                                            iconClass="account-asset__add-asset-icon"
                                            iconWidth={16}
                                            iconHeight={16}
                                            iconName={"cross-circle"}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <div style={{paddingTop: "2rem"}}>
                    <AccountSelector
                        label={"account.user_issued_assets.add_feed"}
                        accountName={this.state.producer_name}
                        account={this.state.producer_name}
                        onChange={this.onAccountNameChanged.bind(this)}
                        onAccountChanged={this.onAccountChanged.bind(this)}
                        error={null}
                        tabIndex={1}
                        action_label="account.perm.confirm_add"
                        onAction={this.props.onChangeList.bind(
                            this,
                            "add",
                            this.state.new_producer_id
                        )}
                    />
                </div>
            </div>
        );
    }
}
