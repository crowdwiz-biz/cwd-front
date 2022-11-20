import React from "react";
import utils from "common/utils";
import asset_utils from "common/asset_utils";
import AssetWrapper from "./AssetWrapper";
import counterpart from "counterpart";
import PropTypes from "prop-types";
import {Popover} from "crowdwiz-ui-modal";

class AssetName extends React.Component {
    static propTypes = {
        replace: PropTypes.bool.isRequired,
        dataPlace: PropTypes.string.isRequired
    };

    static defaultProps = {
        replace: true,
        noPrefix: false,
        noTip: false,
        dataPlace: "bottom"
    };

    shouldComponentUpdate(np) {
        return (
            this.props.replace !== np.replace ||
            this.props.asset !== np.asset ||
            this.props.noPrefix !== np.noPrefix ||
            this.props.noTip !== np.noTip ||
            this.props.dataPlace !== np.dataPlace
        );
    }

    render() {
        let {replace, asset, noPrefix, customClass, noTip} = this.props;
        if (!asset) return null;
        const name = asset.get("symbol");
        const isBitAsset = asset.has("bitasset");
        const isPredMarket =
            isBitAsset && asset.getIn(["bitasset", "is_prediction_market"]);

        let {name: replacedName, prefix} = utils.replaceName(asset);
        const hasBitPrefix = prefix === "bit";

        let includeBitAssetDescription =
            isBitAsset && !isPredMarket && hasBitPrefix;

        if ((replace && replacedName !== name) || isBitAsset) {
            let desc = asset_utils.parseDescription(
                asset.getIn(["options", "description"])
            );

            let realPrefix = name.split(".");
            realPrefix = realPrefix.length > 1 ? realPrefix[0] : null;
            if (realPrefix) realPrefix += ".";
            let optional = "";

            try {
                optional =
                    realPrefix || includeBitAssetDescription
                        ? counterpart.translate(
                              "gateway.assets." +
                                  (hasBitPrefix
                                      ? "bit"
                                      : realPrefix
                                            .replace(".", "")
                                            .toLowerCase()),
                              {
                                  asset: name,
                                  backed: includeBitAssetDescription
                                      ? desc.main
                                      : replacedName
                              }
                          )
                        : "";
            } catch (e) {}
            if (isBitAsset && name === "CNY") {
                optional =
                    optional +
                    " " +
                    counterpart.translate("gateway.assets.bitcny");
            }

            const upperCasePrefix =
                prefix && prefix === "bit"
                    ? prefix
                    : !!prefix
                    ? prefix.toUpperCase()
                    : prefix;
            let assetDiv = (
                <div
                    className={
                        "inline-block" +
                        (this.props.noTip ? "" : " tooltip") +
                        (customClass ? " " + customClass : "")
                    }
                >
                    <span className="asset-prefix-replaced">{prefix}</span>
                    <span>{replacedName}</span>
                </div>
            );
            if (!!noTip) {
                return assetDiv;
            } else {
                let title =
                    (upperCasePrefix || "") + replacedName.toUpperCase();
                let popoverContent = (
                    <div style={{maxWidth: "25rem"}}>
                        {desc.short ? desc.short : desc.main || ""}
                        {optional !== "" && <br />}
                        {optional !== "" && <br />}
                        {optional}
                    </div>
                );
                return (
                    <Popover
                        placement={this.props.dataPlace}
                        content={popoverContent}
                        title={title}
                        trigger="hover"
                    >
                        {assetDiv}
                    </Popover>
                );
            }
        } else {
            let assetDiv = (
                <span className={customClass ? customClass : null}>
                    <span className={!noPrefix ? "asset-prefix-replaced" : ""}>
                        {!noPrefix ? prefix : null}
                    </span>
                    <span>{replacedName}</span>
                </span>
            );
            if (!!noTip) {
                return assetDiv;
            } else {
                let desc = null;
                if (replacedName == "CWD") {
                    desc = {main: counterpart.translate("assets.CWD")};
                } else {
                    desc = asset_utils.parseDescription(
                        asset.getIn(["options", "description"])
                    );
                }
                let title = (prefix || "") + replacedName.toUpperCase();
                let popoverContent = (
                    <div style={{maxWidth: "25rem"}}>
                        {desc.short ? desc.short : desc.main || ""}
                    </div>
                );
                return (
                    <Popover
                        placement={this.props.dataPlace}
                        content={popoverContent}
                        title={title}
                        trigger="hover"
                    >
                        {assetDiv}
                    </Popover>
                );
            }
        }
    }
}

AssetName = AssetWrapper(AssetName);

export default class AssetNameWrapper extends React.Component {
    render() {
        return <AssetName {...this.props} asset={this.props.name} />;
    }
}
