import React from "react";
import { ChainStore } from "bitsharesjs";
import { connect } from "alt-react";
import AccountStore from "stores/AccountStore";
import Translate from "react-translate-component";
import NewIcon from "../NewIcon/NewIcon";
import DexIndexItem from "./DexIndexItem";
import AssetStore from "stores/AssetStore";
import { Apis } from "bitsharesjs-ws";


//STYLES
import "./scss/trading-pair-selection.scss";

class TradingSelector extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            assetCount: 0,
            assets: [],
            assets_01: [],
            assets_02: [],
            selected_asset_01: "1.3.0",
            selected_asset_02: "1.3.1",
            trade_pair_obj: [],
            userTradePairList: ""
        };
    }

    componentWillMount() {
        this.getAssets();
    }

    getAssets() {
        Apis.instance()
            .db_api()
            .exec("get_asset_count", [])
            .then(data => {
                let objectsArray = [];
                let blackList = [2, 3, 4, 6, 7, 8, 9, 11, 12, 14, 15, 16, 18, 19, 20, 22, 24, 25, 26, 27, 28, 29, 30, 33, 34, 39, 40, 41, 42, 43, 44,];
                for (var i = 0; i < parseInt(data); i++) {
                    if (!blackList.includes(i)) {
                        let element = "1.3." + i.toString();
                        objectsArray.push(element)
                    }
                }
                Apis.instance()
                    .db_api()
                    .exec("get_objects", [objectsArray])
                    .then(data => {
                        let { selected_asset_01, selected_asset_02 } = this.state;
                        let assets = {};
                        let assets_01 = {};
                        let assets_02 = {};

                        data.map(asset => {
                            assets[asset['id']] = asset['symbol'];
                            if (asset['id'] != selected_asset_01) {
                                assets_02[asset['id']] = asset['symbol'];
                            }
                            if (asset['id'] != selected_asset_02) {
                                assets_01[asset['id']] = asset['symbol'];
                            }
                        }
                        )
                        this.setState({
                            assets_01: assets_01,
                            assets_02: assets_02,
                            assets: assets
                        });
                    })

            });
    }

    removeAsset02(e) {
        let { assets } = this.state;
        let assets_02 = {};
        Object.keys(assets).map(asset => {
            if (asset != e.target.value) {
                assets_02[asset] = assets[asset]
            }
        })
        this.setState({
            selected_asset_01: e.target.value,
            assets_02: assets_02
        });
    }

    removeAsset01(e) {
        let { assets } = this.state;
        let assets_01 = {};
        Object.keys(assets).map(asset => {
            if (asset != e.target.value) {
                assets_01[asset] = assets[asset]
            }
        })
        this.setState({
            selected_asset_02: e.target.value,
            assets_01: assets_01
        });
    }

    swapAssets(e) {
        let { assets_01, assets_02, selected_asset_01, selected_asset_02 } = this.state;
        this.setState({
            assets_01: assets_02,
            assets_02: assets_01,
            selected_asset_01: selected_asset_02,
            selected_asset_02: selected_asset_01,
        });
    }

    showTradePair(selected_asset_01, selected_asset_02, e) {

        let assets = this.state.assets;
        let asset_ticker_01 = assets[selected_asset_01];
        let asset_ticker_02 = assets[selected_asset_02];

        this.setState({
            trade_pair_obj: [
                {
                    base: selected_asset_01,
                    quote: selected_asset_02,
                    name: asset_ticker_01 + " - " + asset_ticker_02,
                    link: asset_ticker_01 + "_" + asset_ticker_02,
                }
            ]
        })
    }

    updateTradePairsList() {
        this.setState({
            userTradePairList: "updated!"
        })
    }

    render() {
        let { assets_01, assets_02, selected_asset_01, selected_asset_02, trade_pair_obj } = this.state;
        let user_trade_pairs = JSON.parse(localStorage.getItem("user_trade_pairs"));

        return (
            <div className="trading-pair-selection">
                <div className="trading-pair-selection__inner">
                    <Translate
                        className="trading-pair-selection__description"
                        content="dex_index.trade_pair_selection.description" />

                    <div className="trading-pair-selection__grid">
                        <div className="trading-pair-selection__container">
                            <select
                                className="cwd-common__select"
                                name="assetSelector1"
                                id="assetSelector1"
                                onChange={this.removeAsset02.bind(this)}
                                value={selected_asset_01}
                            >

                                {Object.keys(assets_01).map(asset => (
                                    <option
                                        key={asset}
                                        value={asset}>
                                        {assets_01[asset]}
                                    </option>
                                ))}

                            </select>

                            <NewIcon
                                iconClass="trading-pair-selection__change-btn"
                                iconWidth={22}
                                iconHeight={22}
                                iconName="dex_change_assets_btn"
                                onClick={this.swapAssets.bind(this)}
                            />

                            <select
                                className="cwd-common__select"
                                name="assetSelector2"
                                id="assetSelector2"
                                value={selected_asset_02}
                                onChange={this.removeAsset01.bind(this)}

                            >
                                {Object.keys(assets_02).map(asset => (
                                    <option
                                        key={asset}
                                        value={asset}>
                                        {assets_02[asset]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            className="trading-pair-selection__show-pair-btn noselect"
                            onClick={this.showTradePair.bind(
                                this,
                                selected_asset_01,
                                selected_asset_02
                            )}
                        >
                            <Translate content="dex_index.trade_pair_selection.show_pair_btn" />
                        </button>
                    </div>
                </div>

                {trade_pair_obj.length > 0 ?
                    <ul className="dex-index__list">
                        {trade_pair_obj.map((assetObj, index) => (
                            <DexIndexItem
                                key={index}
                                itemClass="dex-item"
                                asset_data={assetObj}
                                isOption={false}
                                isCFD={false}
                                isUserTradePair={true}
                                updateTradePairsList={this.updateTradePairsList.bind(this)}
                            />
                        ))}
                    </ul>
                    : null}

                {user_trade_pairs && user_trade_pairs.length > 0 ?
                    <div>
                        <Translate
                            className="dex-index__title"
                            content="dex_index.trade_pair_selection.my_trade_pairs_title" />

                        <ul className="dex-index__list dex-index__list--favourites">
                            {user_trade_pairs.map((assetObj, index) => (
                                <DexIndexItem
                                    key={index}
                                    itemClass="dex-item"
                                    asset_data={assetObj}
                                    isOption={false}
                                    isCFD={false}
                                    isUserTradePair={true}
                                    updateTradePairsList={this.updateTradePairsList.bind(this)}
                                />
                            ))}
                        </ul>
                    </div>
                    : null}
            </div>
        );
    }
}

export default TradingSelector;