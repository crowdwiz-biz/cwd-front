import React from "react";
import Translate from "react-translate-component";
import { Link } from "react-router-dom";
import FormattedAsset from "../../Utility/FormattedAsset";
import NewIcon from "../../NewIcon/NewIcon";
import ChangeRefModal from "./utility/ChangeRefModal";
import { ChainStore } from "bitsharesjs";


class MainUserData extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isrefModalVisisble: false
        }
    }

    showRefModal() {
        this.setState({
            isrefModalVisisble: true
        })
    }

    closeRefModal() {
        this.setState({
            isrefModalVisisble: false
        })
    }

    render() {
        let { accountId, accountName, referrer, lastGRvolume, notMyAccount, leadersLevel } = this.props;
        let { isrefModalVisisble } = this.state;
        let width = window.innerWidth;

        let isAmbassador;
        let ambassadorsList = ChainStore.fetchFullAccount("ambassadors-list");

        if (accountId && ambassadorsList) {
            isAmbassador =
                ambassadorsList
                    .get("whitelisted_accounts")
                    .indexOf(accountId) >= 0;
        }

        return (
            <div className="main-user-data__wrap">
                <div className="main-user-data__column-wrap">
                    {/* USER */}
                    <div className="main-user-data__column">
                        <Translate
                            className="main-user-data__label"
                            content="user_profile.user_login" />

                        {isAmbassador ?
                            <NewIcon
                                iconClass="main-user-data__abassador-icon"
                                iconWidth={19}
                                iconHeight={12}
                                iconName="ambassador-icon"
                            />
                            : null}

                        <span className="main-user-data__text main-user-data__text--login">{accountName}</span>
                    </div>

                    {/* REFERRER */}
                    <div className="main-user-data__column main-user-data__column--with-btn">
                        <div>
                            <Translate
                                className="main-user-data__label"
                                content="user_profile.user_referrer" />

                            <Link
                                to={`/profile/${referrer}`}
                                className="main-user-data__text main-user-data__text--referrer"
                            >
                                {referrer}
                            </Link>
                        </div>

                        {!notMyAccount ?
                            <button
                                type="button"
                                className="cwd-btn__action-btn cwd-btn__action-btn--gold-border"
                                onClick={this.showRefModal.bind(this)}
                            >
                                <Translate content="user_profile.change_btn" />
                            </button>
                            : null}
                    </div>

                    {/* PERSONAL VOLUME */}
                    <div className="main-user-data__column">
                        <Translate
                            className="main-user-data__label"
                            content="user_profile.leader_level" />

                        <span className="main-user-data__text">
                            {leadersLevel}
                            <Translate
                                content="user_profile.leader_level_from" />
                        </span>
                    </div>
                </div>

                <div className="main-user-data__row-wrap">
                    {/* FIRSTLINE VOLUME */}
                    <div className="main-user-data__text-wrap">
                        <Translate
                            className="main-user-data__label"
                            content="user_profile.first_line_volume" />

                        <span className="main-user-data__text">
                            <FormattedAsset
                                amount={lastGRvolume}
                                asset={"1.3.0"}
                                decimalOffset={5}
                                hide_asset={false}
                            />
                        </span>
                    </div>

                    {/* PORTFOLIO */}

                    <div className="main-user-data__btn-wrap">
                        <Link
                            to={`/account/${accountName}/portfolio`}
                            className="cwd-btn__action-btn cwd-btn__action-btn--gold-border"
                        >
                            <Translate content="account.portfolio" />
                        </Link>

                        {/* OP HISTORY */}
                        <Link
                            to={`/account/${accountName}`}
                            className="cwd-btn__action-btn cwd-btn__action-btn--gold-border"
                        >
                            <Translate content="user_profile.op_history_btn" />

                            <NewIcon
                                iconClass="main-user-data__btn-icon"
                                iconWidth={width > 576 ? 12 : 9}
                                iconHeight={width > 576 ? 11 : 7}
                                iconName={"link_btn_arrow"}
                            />
                        </Link>
                    </div>
                </div>

                {isrefModalVisisble ?
                    <ChangeRefModal
                        accountId={accountId}
                        closeRefModal={this.closeRefModal.bind(this)}
                    />
                    : null}
            </div>
        );
    }
}

export default MainUserData;