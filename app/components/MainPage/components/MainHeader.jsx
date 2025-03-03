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

// IMAGES
import logo from "assets/svg-images/svg-common/main-page/header/logo.svg";

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
        // let account = this.state.account;
        let containerWidth = window.innerWidth;
        let { marketCapUsd, accountTotal, accountgraphData } = this.props;

        return (
            <section className="mp-center-wrap mp-header__wrap">
                <div className="mp-header__user-block">
                    <div className="empty"></div>

                    <img
                        src={logo}
                        className="mp-header__logo"
                        alt="cwdLogo"
                        width="100"
                        heigth="100"
                    />

                    <div  className="mp-header__row-end">
                        <LocaleSelector />
                        <button
                            type="button"
                            className="mp-header__login-btn"
                            onClick={this.logIn.bind(this)}
                        >
                            <Translate
                                content="main_page.header.login-btn"
                            />
                        </button>
                    </div>
                </div>

                <div className="mp-header">
                    <h1 className="title">
                        CrowdWiz. Decentralization. World.
                    </h1>
                    <div className="main-description">
                        <Translate
                            content="main_page.footer.description"
                        />
                    </div>
                    <div className="mp-header__auth-block">
                        <Link
                            className="mp-header__auth-block-btn mp-header__auth-block-btn--reg noselect"
                            to={"/create-account/password"}
                        >
                            <Translate content="main_page.header.register_btn" />
                        </Link>

                        <button
                            className="mp-header__auth-block-btn mp-header__auth-block-btn--login noselect"
                            onClick={this.logIn.bind(this)}
                        >
                            <Translate
                                content="main_page.header.login-btn"
                            />
                        </button>
                    </div>

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

                    {/*/!* HASH BLOCK *!/*/}
                </div>
            </section>
        );
    }
}

export default MainHeader;
