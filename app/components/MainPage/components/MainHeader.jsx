import React from "react";
import Translate from "react-translate-component";
import { Link } from "react-router-dom";
import AltContainer from "alt-container";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";
import BlockchainStore from "stores/BlockchainStore";
import LocaleSelector from "./utility/LocaleSelector";
import HeaderDailyStats from "./HeaderDailyStats";
import RegChartBlock from "./utility/RegChartBlock";
import BlockHash from "./utility/BlockHash";


// IMAGES
import cwdLogo from "assets/svg-images/svg-common/main-page/header/cwd_logo.svg";
import loginIcon from "assets/svg-images/svg-common/main-page/header/login_icon.svg";

class MainHeader extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            account: this.props.account
        };
    }

    logIn() {
        WalletUnlockActions.unlock()
            .then(() => {
                AccountActions.tryToSetCurrentAccount();
                this.props.history.push(
                    "/account/" + this.props.account.get("name")
                );
            })
            .catch(() => { });
    }

    render() {
        let account = this.state.account;
        let containerWidth = window.innerWidth;
        let { marketCapUsd, accountTotal, accountgraphData } = this.props;

        return (
            <section className="mp-center-wrap mp-header__wrap">
                <div className="mp-header__user-block">
                    <LocaleSelector />

                    <img
                        src={cwdLogo}
                        className="mp-header__logo"
                        alt="cwdLogo"
                        width="100"
                        heigth="100"
                    />

                    <button
                        type="button"
                        className="mp-header__login-btn"
                        onClick={this.logIn.bind(this)}
                    >
                        {containerWidth > 767 ? (
                            <Translate
                                className="mp-header__login-text"
                                content="main_page.header.login-btn"
                            />
                        ) : null}

                        <img
                            src={loginIcon}
                            className="mp-header__login-img"
                            alt="login"
                            width="34"
                            heigth="30"
                        />
                    </button>
                </div>

                <div className="mp-header">
                    <div className="mp-header__left-column">
                        <h1 className="mp-header__cwd-title">
                            crowdwiz. world. decentralization.
                        </h1>

                        {!account && containerWidth < 1280 ? (
                            <Link
                                className="mp-header__auth-block-btn mp-header__auth-block-btn--reg noselect"
                                to={`/create-account/password`}
                            >
                                <Translate content="main_page.header.register_btn" />
                            </Link>
                        ) : null}
                    </div>

                    <div className="mp-header__right-column">
                        <AltContainer
                            stores={[BlockchainStore]}
                            inject={{
                                latestBlocks: () => {
                                    return BlockchainStore.getState()
                                        .latestBlocks;
                                }
                            }}
                        >
                            <HeaderDailyStats
                                containerWidth={containerWidth}
                                marketCapUsd={marketCapUsd}
                                accountTotal={accountTotal}
                                accountgraphData={accountgraphData}
                            />
                        </AltContainer>

                        <RegChartBlock
                            accountTotal={accountTotal}
                            accountgraphData={accountgraphData}
                        />

                        {/* HASH BLOCK */}
                        <BlockHash />

                        {containerWidth > 1280 ? (
                            <div className="mp-header__auth-block">
                                {!account ? (
                                    <Link
                                        className="mp-header__auth-block-btn mp-header__auth-block-btn--reg noselect"
                                        to={`/create-account/password`}
                                    >
                                        <Translate content="main_page.header.register_btn" />
                                    </Link>
                                ) : null}

                                <button
                                    className="mp-header__auth-block-btn mp-header__auth-block-btn--login noselect"
                                    onClick={this.logIn.bind(this)}
                                >
                                    <Translate
                                        className="mp-header__login-text"
                                        content="main_page.header.login-btn"
                                    />
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </section>
        );
    }
}

export default MainHeader;
