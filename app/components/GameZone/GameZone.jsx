import React from "react";
import Translate from "react-translate-component";
import {Link} from "react-router-dom";
// import PartnersGame from "./components/PartnersGame";
import AccountStore from "stores/AccountStore";
import {ChainStore} from "bitsharesjs";
import {connect} from "alt-react";
import {partnersData} from "./components/PartnersData";

//STYLES
import "./scss/gamezone.scss";

let headerImg = require("assets/headers/game-zone_header.png");

class GameZone extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let currentAccount;
        if (this.props.account) {
            currentAccount = this.props.account.get("name");
        }

        let partnersItem = partnersData;

        return (
            <div className="gamezone__wrap">
                <div className="gamezone__center-layout">
                    <div className="gamezone__header-wrap">
                        <img
                            className="gamezone__header"
                            src={headerImg}
                            alt=""
                        />
                    </div>

                    <section className="gamezone__block-wrap">
                        <Translate
                            className="gamezone__title"
                            content="gamezone.title"
                            component="h1"
                        />

                        <div className="gamezone__games-wrap">
                            {/* MATRIX POSTER*/}
                            <div className="gamezone-matrix">
                                <div className="gamezone-matrix__inner">
                                    <Translate
                                        className="gamezone-matrix__intro"
                                        content="gamezone.matrix-intro"
                                    />
                                    <Link
                                        className="game-item__btn game-item__btn--matrix noselect"
                                        to={`gamezone/matrix-game`}
                                    >
                                        <Translate
                                            className="game-item__btn-text"
                                            content="gamezone.matrix-btn"
                                            component="span"
                                        />
                                    </Link>
                                </div>
                            </div>

                            <ul className="game-item__list">
                                <li className="game-item">
                                    <div className="game-item__content game-item__content--scoop">
                                        <div className="game-item__inner">
                                            <Translate
                                                className="game-item__title"
                                                content="gamezone.game_lottery"
                                                component="p"
                                            />

                                            <Link
                                                className="game-item__btn noselect"
                                                to={`gamezone/scoop`}
                                            >
                                                <Translate
                                                    className="game-item__btn-text"
                                                    content="gamezone.buy-ticket"
                                                    component="span"
                                                />
                                            </Link>
                                        </div>
                                    </div>
                                </li>
                                <li className="game-item">
                                    <div className="game-item__content game-item__content--heads">
                                        <div className="game-item__inner">
                                            <Translate
                                                className="game-item__title"
                                                content="gamezone.game_heads"
                                                component="p"
                                            />

                                            <Link
                                                className="game-item__btn noselect"
                                                to={`gamezone/heads-or-tails`}
                                            >
                                                <Translate
                                                    className="game-item__btn-text"
                                                    content="gamezone.bet"
                                                    component="span"
                                                />
                                            </Link>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </section>
{/* 
                    <section className="gamezone__block-wrap">
                        <Translate
                            className="gamezone__title"
                            content="gamezone.partners_title"
                            component="h1"
                        />
                        <ul className="partners-game__list">
                            {partnersItem.map(item => (
                                <PartnersGame
                                    currentAccount={currentAccount}
                                    key={item.itemID}
                                    item={item}
                                />
                            ))}
                        </ul>
                    </section> */}
                </div>
            </div>
        );
    }
}
export default GameZone = connect(GameZone, {
    listenTo() {
        return [AccountStore];
    },
    getProps() {
        if (AccountStore.getState().passwordAccount) {
            return {
                account: ChainStore.fetchFullAccount(
                    AccountStore.getState().passwordAccount
                )
            };
        }
    }
});
