import React from "react";
import Translate from "react-translate-component";
import {Link} from "react-router-dom";

//STYLES
import "./scss/crowd-market-item.scss";

class CrowdMarketItem extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let marketData = this.props.item;

        return (
            <li className="crowd-market-item__item" id={marketData.itemID}>
                {!marketData.isActive ? (
                    <Translate
                        className="crowd-market-item__label"
                        content="gamezone.soon"
                        component="span"
                    />
                ) : null}

                <div
                    className={
                        marketData.isActive
                            ? "crowd-market-item__content crowd-market-item__content--" +
                              marketData.imgClass
                            : "crowd-market-item__content crowd-market-item__content--inactive crowd-market-item__content--" +
                              marketData.imgClass
                    }
                >
                    <div className="crowd-market-item__inner">
                        <Translate
                            className="crowd-market-item__title"
                            content={marketData.title}
                            component="p"
                        />

                        {marketData.isOnChainComponent ? (
                            marketData.isActive ? (
                                <Link
                                    className="crowd-market-item__btn noselect"
                                    to={marketData.url}
                                >
                                    <Translate
                                        className="crowd-market-item__btn-text"
                                        content={marketData.btnText}
                                        component="span"
                                    />
                                </Link>
                            ) : (
                                <span className="crowd-market-item__btn noselect">
                                    <Translate
                                        className="crowd-market-item__btn-text"
                                        content={marketData.btnText}
                                        component="span"
                                    />
                                </span>
                            )
                        ) : (
                            <a
                                className="crowd-market-item__btn noselect"
                                href={marketData.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Translate
                                    className="crowd-market-item__btn-text"
                                    content={marketData.btnText}
                                    component="span"
                                />
                            </a>
                        )}
                    </div>
                </div>
            </li>
        );
    }
}

export default CrowdMarketItem;
