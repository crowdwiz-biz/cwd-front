import React from "react";
import Translate from "react-translate-component";
import SettingsActions from "actions/SettingsActions";

//STYLES
import "../scss/faucet-settings.scss";

class FaucetSettings extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            alert: false
        };
    }

    handleFaucet(e) {
        let userFaucet = e.target.value;

        SettingsActions.changeSetting({
            setting: "faucet_address",
            value: userFaucet
        });
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
    }

    showSuccessAleft() {
        this.setState({
            alert: true
        });

        this.timer = setTimeout(() => {
            this.setState({alert: false});
        }, 2000);
    }

    render() {
        return (
            <div className="app-settings__inner">
                <div className="faucet-settings__wrap">
                    <Translate
                        className="app-settings__description-text"
                        content="settings.faucet_address_text"
                    />

                    <div className="faucet-settings__inner">
                        <Translate
                            className="app-settings__common-text"
                            content="settings.user_address_text"
                        />

                        <div className="faucet-settings__input-wrap">
                            <input
                                type="text"
                                className="app-settings__input"
                                value={this.props.faucetAddress}
                                onChange={this.handleFaucet.bind(this)}
                            />

                            {this.state.alert ? (
                                <Translate
                                    className="app-settings__alert"
                                    content="settings.user_faucer_success"
                                />
                            ) : null}
                        </div>

                        <button
                            type="button"
                            className="app-settings__btn"
                            onClick={this.showSuccessAleft.bind(this)}
                        >
                            <Translate content="verification_word.btn" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default FaucetSettings;
