
import React from "react";
import { Link } from "react-router-dom";
import BlockchainActions from "actions/BlockchainActions";
import Translate from "react-translate-component";
import { FormattedDate } from "react-intl";
import Operation from "../Blockchain/Operation";
import LinkToWitnessById from "../Utility/LinkToWitnessById";
import ChainTypes from "../Utility/ChainTypes";
import BindToChainState from "../Utility/BindToChainState";
import AssetWrapper from "../Utility/AssetWrapper";
import TransactionChart from "./TransactionChart";
import BlocktimeChart from "./BlocktimeChart";
import utils from "common/utils";
import Immutable from "immutable";
import FormattedAsset from "../Utility/FormattedAsset";
import TransitionWrapper from "../Utility/TransitionWrapper";
import counterpart from "counterpart";
import { Tabs, Tab } from "../Utility/Tabs";
import ExplorerBlocks from "./ExplorerBlocks"


import "./scss/explorer-all.scss"
require("../Blockchain/json-inspector.scss");


class Explorer extends React.Component {
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

    constructor(props) {
        super(props);

        this.state = {
            animateEnter: false,
            operationsHeight: null,
            blocksHeight: null
        };
    }

    _getBlock(height, maxBlock) {
        if (height) {
            height = parseInt(height, 10);
            BlockchainActions.getLatest(height, maxBlock);
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.latestBlocks.size === 0) {
            return this._getInitialBlocks();
        } else if (!this.state.animateEnter) {
            this.setState({
                animateEnter: true
            });
        }

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

    handleBlockHash() {
        let blockHash = this.refs.blockHashInput.value;

        this.setState({
            blockHash: blockHash
        })
    }

    render() {
        let {
            latestBlocks,
            latestTransactions,
            globalObject,
            dynGlobalObject,
            coreAsset
        } = this.props;



        let { blockHash } = this.state;

        let href = "/hash/";
        if (blockHash && blockHash.length < 40) {
            href = "/profile/"; 
        }

        const dynamicObject = this.props.getDynamicObject(
            coreAsset.get("dynamic_asset_data_id")
        );
        let blocks = null,
            transactions = null;
        let headBlock = null;
        let trxCount = 0,
            blockCount = latestBlocks.size,
            trxPerSec = 0,
            blockTimes = [],
            avgTime = 0;

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

            // Output block rows for the last 20 blocks
            blocks = latestBlocks
                .sort((a, b) => {
                    return b.id - a.id;
                })
                .take(20)
                .map(block => {
                    return (
                        <div key={block.id} className="recent-blocks__row">

                            <Link
                                to={`/block/${block.id}`}
                                className="cwd-common__link recent-blocks__block-num"
                            >
                                #{utils.format_number(block.id, 0)}
                            </Link>

                            <span className="recent-blocks__date">
                                <FormattedDate
                                    value={block.timestamp}
                                    format="full"
                                />
                            </span>

                            <span className="recent-blocks__witness-name">
                                <LinkToWitnessById witness={block.witness} />
                            </span>

                            <span>
                                {utils.format_number(
                                    block.transactions.length,
                                    0
                                )}
                            </span>
                        </div>
                    );
                })
                .toArray();

            let trxIndex = 0;


            transactions = latestTransactions
                .sort((a, b) => {
                    return b.block_num - a.block_num;
                })
                .take(20)
                .map(trx => {
                    let opIndex = 0;
                    return trx.operations
                        .map(op => {
                            if (trxIndex > 15) return null;
                            return (
                                <Operation
                                    key={trxIndex++}
                                    op={op}
                                    result={trx.operation_results[opIndex++]}
                                    block={trx.block_num}
                                    hideFee={true}
                                    hideOpLabel={false}
                                    current={"1.2.0"}
                                    hideDate={false}
                                    hidePending={false}
                                    operationsInfo={true}
                                    mainPageMode={false}
                                    notificationMode={false}
                                    shortMode={false}
                                />
                            );
                        })
                        .filter(a => !!a);
                })
                .toArray();

            headBlock = latestBlocks.first().timestamp;
            avgTime = blockTimes.reduce((previous, current, idx, array) => {
                return previous + current[1] / array.length;
            }, 0);

            trxPerSec = trxCount / ((lastBlock - firstBlock) / 1000);
        }

        let blockNum = dynGlobalObject.get("head_block_number").toString();
        let formatBlockNum = blockNum.replace(/(\d)(?=(\d{3})+$)/g, "$1 ");

        let deviceWidth = window.innerWidth;

        return (
            <section className="explorer__wrap">
                <Translate
                    className="cwd-common__title explorer__header"
                    component="div"
                    content="explorer.blocks.explorer"
                />

                <Tabs
                    className="underlined-tabs"
                    tabsClass="underlined-tabs__list"
                    contentClass="underlined-tabs__content"
                    segmented={false}
                    actionButtons={false}
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab title="explorer.blocks.tab_title_01">
                        <div className="cwd-common__wrap-920">
                            <ExplorerBlocks
                                formatBlockNum={formatBlockNum}
                                headBlock={headBlock}
                                trxPerSec={trxPerSec}
                                avgTime={avgTime}
                                trxCount={trxCount}
                                blockCount={blockCount}
                                activeWitnesses={globalObject.get("active_witnesses").size}
                                activeWitnessesFull={globalObject.get("active_witnesses")}
                                committeeMembers={globalObject.get("active_committee_members").size}
                                missedBlocks={dynGlobalObject.get("recently_missed_count")}
                                currentSupply={dynamicObject ? (
                                    <FormattedAsset
                                        amount={dynamicObject.get("current_supply")}
                                        asset={coreAsset.get("id")}
                                        decimalOffset={5}
                                    />
                                ) : null}
                                stealthSupply={dynamicObject ? (
                                    <FormattedAsset
                                        amount={dynamicObject.get(
                                            "confidential_supply"
                                        )}
                                        asset={coreAsset.get("id")}
                                        decimalOffset={5}
                                    />
                                ) : null}
                                currentWitness={dynGlobalObject ? dynGlobalObject.get("current_witness") : null}
                                deviceWidth={deviceWidth}
                            />

                            {/* HASH BLOCK */}
                            <div className="block-hash__container">
                                <Translate
                                    className="explorer__subtitle"
                                    content="explorer.blocks.block_hash_title"
                                />

                                <div className="block-hash__inner">
                                    <input
                                        className="cwd-common__input"
                                        ref="blockHashInput"
                                        type="text"
                                        placeholder={counterpart.translate("explorer.blocks.enter_hash")}
                                        onChange={this.handleBlockHash.bind(this)}
                                    />

                                    <Link
                                        className="cwd-btn__action-btn noselect"
                                        to={href + blockHash}
                                    >
                                        <Translate content="explorer.block.go_to_btn" />
                                    </Link>
                                </div>
                            </div>

                            {/* BLOCK TIME CHART */}

                            <div className="block-chart__wrap">
                                <Translate
                                    className="explorer__subtitle"
                                    content="explorer.blocks.block_times"
                                />

                                <BlocktimeChart
                                    blockTimes={blockTimes}
                                    head_block_number={dynGlobalObject.get(
                                        "head_block_number"
                                    )}
                                />
                            </div>

                            <div className="block-chart__wrap">
                                <Translate
                                    className="explorer__subtitle"
                                    content="explorer.blocks.trx_per_block"
                                />

                                <TransactionChart
                                    blocks={latestBlocks}
                                    head_block={dynGlobalObject.get(
                                        "head_block_number"
                                    )}
                                />
                            </div>
                        </div>
                    </Tab>

                    {/* RECENT OP HISTORY */}
                    <Tab title="explorer.blocks.tab_title_02">
                        <div className="cwd-common__wrap-920">
                            <Translate
                                className="explorer__subtitle"
                                content="explorer.blocks.recent_ops"
                            />

                            <div className="operation__wrap">
                                {transactions}
                            </div>
                        </div>
                    </Tab>

                    <Tab title="explorer.blocks.tab_title_03">
                        <div className="cwd-common__wrap-920 recent-blocks__container">
                            <div className="recent-blocks__table-header">
                                <Translate content="explorer.block.id" />
                                <Translate content="explorer.block.date" />
                                <Translate content="explorer.block.witness" />

                                {deviceWidth > 576 ?
                                    <Translate content="explorer.block.count" />
                                    :
                                    <span>Trx</span>
                                }

                            </div>

                            <TransitionWrapper
                                component="div"
                                transitionName="newrow"
                                className="recent-blocks__blocks-list"
                            >
                                {blocks}
                            </TransitionWrapper>
                        </div>
                    </Tab>
                </Tabs>
            </section>
        );
    }
}

Explorer = BindToChainState(Explorer, { show_loader: true });
Explorer = AssetWrapper(Explorer, {
    propNames: ["coreAsset"],
    withDynamic: true
});
export default Explorer;