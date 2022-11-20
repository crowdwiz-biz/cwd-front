import React from "react";
import Translate from "react-translate-component";
import counterpart from "counterpart";

//STYLES
import "../scss/cwdgateway-header.scss";

class AccountInfo extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let userStatusText = [
            counterpart.translate("cwdgateway.acc_info.status_success"),
            counterpart.translate("cwdgateway.acc_info.status_limit"),
            counterpart.translate("cwdgateway.acc_info.status_blocked")
        ];

        let exchangeStatusText = [
            counterpart.translate("cwdgateway.acc_info.exchange_on"),
            counterpart.translate("cwdgateway.acc_info.exchange_off")
        ];

        return (
            <div className="cwdgateway-header">
                <div className="cwdgateway-header__wrap">
                    <Translate
                        className="cwdgateway-header__title"
                        content="cwdgateway.acc_info.title"
                    />

                    <div className="cwdgateway-header__inner">
                        <div className="cwdgateway-header__row">
                            <Translate
                                className="cwdgateway-header__text"
                                content="cwdgateway.acc_info.successful_trades"
                            />
                            <span className="cwdgateway-header__data">
                                {this.props.successfulTrades}
                            </span>
                        </div>
                        <div className="cwdgateway-header__row">
                            <Translate
                                className="cwdgateway-header__text"
                                content="cwdgateway.acc_info.cancelled_trades"
                            />
                            <span className="cwdgateway-header__data">
                                {this.props.cancelledTrades}
                            </span>
                        </div>
                        <div className="cwdgateway-header__row">
                            <Translate
                                className="cwdgateway-header__text"
                                content="cwdgateway.acc_info.open_trades_max"
                            />
                            <span className="cwdgateway-header__data">
                                {this.props.tradesMax}
                            </span>
                        </div>
                        <div className="cwdgateway-header__row">
                            <Translate
                                className="cwdgateway-header__text"
                                content="cwdgateway.acc_info.status"
                            />
                            <span className="cwdgateway-header__data">
                                {userStatusText[this.props.userStatus]}&nbsp;
                                {this.props.userBanTime}
                            </span>
                        </div>
                        {/* {
                            this.props.isExchange ? <div className="cwdgateway-header__row">
                                <Translate
                                    className="cwdgateway-header__text"
                                    content="cwdgateway.acc_info.exchange_status"
                                />
                                <span className="cwdgateway-header__data">
                                    {exchangeStatusText[this.props.exchangeStatus]}
                                </span>
                            </div>
                                : null
                        } */}
                    </div>
                </div>
            </div>
        );
    }
}

export default AccountInfo;
