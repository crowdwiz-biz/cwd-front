import React from "react";
import Translate from "react-translate-component";
import BlockchainActions from "actions/BlockchainActions";
import utils from "common/utils";
import Immutable from "immutable";
import ChainTypes from "../../Utility/ChainTypes";
import BindToChainState from "../../Utility/BindToChainState";
import FormattedAsset from "../../Utility/FormattedAsset";
import AssetWrapper from "../../Utility/AssetWrapper";
import NewIcon from "../../NewIcon/NewIcon";
import {FormattedNumber} from "react-intl";

class HeaderDailyStats extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isTipVisible: false
        };
    }

    static propTypes = {
        globalObject: ChainTypes.ChainObject.isRequired,
        dynGlobalObject: ChainTypes.ChainObject.isRequired
    };

    static defaultProps = {
        globalObject: "2.0.0",
        dynGlobalObject: "2.1.0",
        coreAsset: "1.3.0",
        latestBlocks: {},
        assets: {},
        accounts: {},
        height: 1
    };

    _getBlock(height, maxBlock) {
        if (height) {
            height = parseInt(height, 10);
            BlockchainActions.getLatest(height, maxBlock);
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        let maxBlock = nextProps.dynGlobalObject.get("head_block_number");
        if (
            nextProps.latestBlocks.size >= 20 &&
            nextProps.dynGlobalObject.get("head_block_number") !==
                nextProps.latestBlocks.get(0).id
        ) {
            return this._getBlock(maxBlock, maxBlock);
        }
    }

    componentDidMount() {
        this._getInitialBlocks();
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            !Immutable.is(nextProps.latestBlocks, this.props.latestBlocks) ||
            !utils.are_equal_shallow(nextState, this.state)
        );
    }
    _getInitialBlocks() {
        let maxBlock = parseInt(
            this.props.dynGlobalObject.get("head_block_number"),
            10
        );
        if (maxBlock) {
            for (let i = 19; i >= 0; i--) {
                let exists = false;
                if (this.props.latestBlocks.size > 0) {
                    for (let j = 0; j < this.props.latestBlocks.size; j++) {
                        if (
                            this.props.latestBlocks.get(j).id ===
                            maxBlock - i
                        ) {
                            exists = true;
                            break;
                        }
                    }
                }
                if (!exists) {
                    this._getBlock(maxBlock - i, maxBlock);
                }
            }
        }
    }

    showTip() {
        let isTipVisible = this.state.isTipVisible;

        this.setState({
            isTipVisible: !isTipVisible
        });
    }

    render() {
        let marketCapUsd = this.props.marketCapUsd;

        let containerWidth = this.props.containerWidth;
        let {latestBlocks, dynGlobalObject, coreAsset} = this.props;

        let trxCount = 0,
            trxPerSec = 0,
            blockTimes = [];

        let blockNum = dynGlobalObject.get("head_block_number").toString();
        let formatBlockNum = blockNum.replace(/(\d)(?=(\d{3})+$)/g, "$1 ");

        const dynamicObject = this.props.getDynamicObject(
            coreAsset.get("dynamic_asset_data_id")
        );
        let isTipVisible = this.state.isTipVisible;
        if (latestBlocks && latestBlocks.size >= 20) {
            let previousTime;
            let lastBlock, firstBlock;

            // Map out the block times for the latest blocks and count the number of transactions
            latestBlocks
                .filter((a, index) => {
                    // Only use consecutive blocks counting back from head block
                    return (
                        a.id ===
                        dynGlobalObject.get("head_block_number") - index
                    );
                })
                .sort((a, b) => {
                    return a.id - b.id;
                })
                .forEach((block, index) => {
                    trxCount += block.transactions.length;
                    if (index > 0) {
                        blockTimes.push([
                            block.id,
                            (block.timestamp - previousTime) / 1000
                        ]);
                        lastBlock = block.timestamp;
                    } else {
                        firstBlock = block.timestamp;
                    }
                    previousTime = block.timestamp;
                });
            trxPerSec = trxCount / ((lastBlock - firstBlock) / 1000);
        }
        return (
            <section className="header-daily-stat">
                {/* Current Block */}
                <div className="header-daily-stat__item">
                    <Translate
                        className="header-daily-stat__title"
                        content="main_page.header.current_block"
                    />

                    <span className="header-daily-stat__data">
                        # {formatBlockNum}
                    </span>
                </div>

                {/* Transactions per second */}
                <div className="header-daily-stat__item">
                    <Translate
                        className="header-daily-stat__title"
                        content="main_page.header.trx_per_sec"
                    />

                    <span className="header-daily-stat__data">
                        {utils.format_number(trxPerSec, 2)}
                    </span>
                </div>

                {/* Current supply CWD */}
                <div className="header-daily-stat__item">
                    <div className="header-daily-stat__title">
                        <Translate content="main_page.header.current_supply" />

                        <span className="header-daily-stat__highlighted">
                            cwd:
                        </span>
                    </div>

                    <span className="header-daily-stat__data">
                        {dynamicObject ? (
                            <FormattedAsset
                                amount={dynamicObject.get("current_supply")}
                                asset={coreAsset.get("id")}
                                decimalOffset={5}
                                hide_asset={true}
                            />
                        ) : null}
                    </span>
                </div>

                {/* Market Capitalization USD */}
                <div className="header-daily-stat__item">
                    <div className="header-daily-stat__title">
                        <Translate content="main_page.header.market_cap" />

                        <span className="header-daily-stat__highlighted">
                            usd:
                        </span>
                    </div>

                    <span className="header-daily-stat__data">
                        <FormattedNumber
                            unitDisplay="long"
                            value={marketCapUsd}
                        />
                    </span>

                    <button
                        className="header-daily-stat__tip-btn noselct"
                        type="button"
                        onClick={this.showTip.bind(this)}
                    >
                        <NewIcon
                            iconWidth={containerWidth > 767 ? 24 : 16}
                            iconHeight={containerWidth > 767 ? 24 : 16}
                            iconName={"tips_icon"}
                        />
                    </button>

                    {isTipVisible ? (
                        <div
                            className="header-daily-stat__tip-box"
                            onClick={this.showTip.bind(this)}
                        >
                            <Translate content="main_page.header.market_cap_tip" />
                        </div>
                    ) : null}
                </div>
            </section>
        );
    }
}
HeaderDailyStats = BindToChainState(HeaderDailyStats, {show_loader: true});
HeaderDailyStats = AssetWrapper(HeaderDailyStats, {
    propNames: ["coreAsset"],
    withDynamic: true
});
export default HeaderDailyStats;
