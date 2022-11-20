import React from "react";
import {connect} from "alt-react";
import AccountStore from "stores/AccountStore";
import Translate from "react-translate-component";
import {isIncognito} from "feature_detect";
import CreateAccountPassword from "./Account/CreateAccountPassword";
import {Route} from "react-router-dom";

// IMAGES
import cwdLogo from "assets/svg-images/svg-common/main-page/header/cwd_logo.svg";

class LoginSelector extends React.Component {
    constructor(props) {
        super(props);
        this.unmounted = false;
    }

    UNSAFE_componentWillMount() {
        isIncognito(incognito => {
            if (!this.unmounted) {
                this.setState({incognito});
            }
        });
    }

    componentWillUnmount() {
        this.unmounted = true;
    }

    onSelect(route) {
        this.props.history.push("/create-account/" + route);
    }

    render() {
        return (
            <div id="accountForm" className="account-creation__container">
                <div className="account-creation__wrap">
                    <div className="account-creation__header">
                        <img className="account-creation__logo" src={cwdLogo} />
                    </div>

                    <Translate
                        content="header.create_account"
                        className="account-creation__title"
                    />

                    <Route
                        path="/create-account/password"
                        exact
                        component={CreateAccountPassword}
                    />
                </div>
            </div>
        );
    }
}

export default connect(LoginSelector, {
    listenTo() {
        return [AccountStore];
    },
    getProps() {
        return {
            currentAccount:
                AccountStore.getState().currentAccount ||
                AccountStore.getState().passwordAccount
        };
    }
});
