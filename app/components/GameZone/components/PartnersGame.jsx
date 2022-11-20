import React from "react";
import Translate from "react-translate-component";

//STYLES
import "./scss/partners-game.scss";

class PartnersGame extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let currentAccount = this.props.currentAccount;
        let item = this.props.item;

        return item.fullHeight ? (
            <li
                className={
                    "partners-full-heigth partners-full-heigth--" +
                    item.imgClass
                }
            >
                <Translate
                    className="partners-full-heigth__title"
                    content={item.title}
                />

                <a
                    className="partners-game__btn noselect"
                    href={item.url + currentAccount}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Translate
                        className="partners-game__btn-text"
                        content={item.btnText}
                        component="span"
                    />
                </a>
            </li>
        ) : (
            <li className="partners-game__item" id={item.itemID}>
                <div
                    className={
                        "partners-game__content item partners-game__content--" +
                        item.iconClass
                    }
                >
                    <div className="partners-game__inner">
                        <Translate
                            className="partners-game__title"
                            content={item.title}
                            component="p"
                        />

                        <a
                            className="partners-game__btn noselect"
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Translate
                                className="partners-game__btn-text"
                                content={item.btnText}
                                component="span"
                            />
                        </a>
                    </div>
                </div>
            </li>
        );
    }
}

export default PartnersGame;
