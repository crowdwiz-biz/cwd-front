import React from "react";
import Translate from "react-translate-component";
import NewIcon from "../NewIcon/NewIcon";
import { Link } from "react-router-dom";
import TimeAgo from "../Utility/TimeAgo";
import classNames from "classnames";
import utils from "common/utils";
import LinkToAccountById from "../Utility/LinkToAccountById";
import { connect } from "alt-react";
import AccountStore from "stores/AccountStore";
import { ChainStore } from "bitsharesjs";


class BlockTimeAgo extends React.Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.blockTime !== this.props.blockTime;
    }

    render() {
        let { blockTime } = this.props;
        // let timePassed = Date.now() - blockTime;
        let timePassed = new Date().getTime() - new Date(blockTime).getTime();

        let textClass = classNames(
            "explorer-blocks__block-label",
            { "explorer-blocks__block-label--success": timePassed <= 6000 },
            { "explorer-blocks__block-label--info": timePassed > 6000 && timePassed <= 15000 },
            { "explorer-blocks__block-label--warning": timePassed > 15000 && timePassed <= 25000 },
            { "explorer-blocks__block-label--error": timePassed > 25000 }
        );

        return blockTime ? (
            <span className={textClass}>
                <TimeAgo time={blockTime} />
            </span>
        ) : null;
    }
}

class ExplorerBlocks extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidUpdate(prevProps) {
        let { activeWitnessesFull } = this.props;
        if (activeWitnessesFull.size > 0) {
            activeWitnessesFull.map(wit => {
                let cacheWit = ChainStore.getObject(wit)
                if (cacheWit) {
                    ChainStore.getObject(
                        cacheWit.get("witness_account")
                    );
                }
            })
        }

    }
    render() {
        let { formatBlockNum,
            headBlock,
            trxPerSec,
            avgTime,
            trxCount,
            blockCount,
            activeWitnesses,
            committeeMembers,
            missedBlocks,
            currentSupply,
            stealthSupply,
            currentWitness,
            deviceWidth
        } = this.props;


        let current = ChainStore.getObject(currentWitness),
            witnessAccount = null, witnessId = null;
        if (current) {
            witnessAccount = ChainStore.getObject(
                current.get("witness_account")
            );
        }
        if (witnessAccount) {
            witnessId = witnessAccount.get("id")
        }

        let currentAccount;
        if (this.props.currentAccount) {
            currentAccount = this.props.currentAccount.get("name")
        }

        let processedBlockNum = formatBlockNum.replace(/ /g, '');

        return (
            <div className="explorer-blocks__wrap">
                {/* CURRENT BLOCK */}

                <Link
                    className="explorer-blocks__item explorer-blocks__item--button explorer-blocks__item--current-block"
                    to={`/block/${processedBlockNum}`}
                >
                    <Translate className="explorer-blocks__title" content="explorer.blocks.current_block" />

                    <div className="explorer-blocks__data-container">
                        <NewIcon
                            iconClass="explorer-blocks__icon explorer-blocks__icon--large"
                            iconWidth={20}
                            iconHeight={20}
                            iconName={"explorer_current_block"}
                        />

                        <span className="explorer-blocks__data explorer-blocks__data--large"># {formatBlockNum}</span>
                    </div>
                </Link>

                {/* LAST BLOCK */}
                <div className="explorer-blocks__item explorer-blocks__item">
                    <Translate className="explorer-blocks__title" content="explorer.blocks.last_block" />

                    <div className="explorer-blocks__data-container">
                        <NewIcon
                            iconClass="explorer-blocks__icon"
                            iconWidth={16}
                            iconHeight={16}
                            iconName={"explorer_last_block"}
                        />

                        <span className="explorer-blocks__data">
                            <BlockTimeAgo blockTime={headBlock} />
                        </span>
                    </div>
                </div>

                {/* AVERAGE TIME */}
                <div className="explorer-blocks__item explorer-blocks__item">
                    <Translate className="explorer-blocks__title" content="explorer.blocks.avg_conf_time" />

                    <div className="explorer-blocks__data-container">
                        <NewIcon
                            iconClass="explorer-blocks__icon"
                            iconWidth={16}
                            iconHeight={16}
                            iconName={"explorer_average_block_time"}
                        />

                        <span className="explorer-blocks__data">
                            {utils.format_number(avgTime / 2, 2)}s
                        </span>
                    </div>
                </div>

                {/* TRX PER SEC */}
                <div className="explorer-blocks__item explorer-blocks__item">
                    <Translate className="explorer-blocks__title" content="explorer.blocks.trx_per_sec" />

                    <div className="explorer-blocks__data-container">
                        <NewIcon
                            iconClass="explorer-blocks__icon"
                            iconWidth={16}
                            iconHeight={16}
                            iconName={"explorer_trx_sec"}
                        />

                        <span className="explorer-blocks__data">
                            {utils.format_number(trxPerSec / 2, 2)}
                        </span>
                    </div>
                </div>

                {/* TRX PER BLOCK */}
                <div className="explorer-blocks__item explorer-blocks__item">
                    <Translate className="explorer-blocks__title" content="explorer.blocks.trx_per_block" />

                    <div className="explorer-blocks__data-container">
                        <NewIcon
                            iconClass="explorer-blocks__icon"
                            iconWidth={16}
                            iconHeight={16}
                            iconName={"explorer_trx_block"}
                        />

                        <span className="explorer-blocks__data">
                            {utils.format_number(trxCount / blockCount || 0, 2)}
                        </span>
                    </div>
                </div>

                {/* CURRENT SUPLY */}
                <div className="explorer-blocks__item explorer-blocks__item">
                    <Translate className="explorer-blocks__title" content="explorer..asset.summary.current_supply" />

                    <div className="explorer-blocks__data-container">
                        <NewIcon
                            iconClass="explorer-blocks__icon"
                            iconWidth={16}
                            iconHeight={16}
                            iconName={"explorer_cwd_amount"}
                        />

                        <span className="explorer-blocks__data explorer-blocks__data--current-supply">{currentSupply}</span>
                    </div>
                </div>

                {/* STEALTH SUPPLY */}
                <div className="explorer-blocks__item explorer-blocks__item">
                    <Translate className="explorer-blocks__title" content="explorer..asset.summary.stealth_supply" />

                    <div className="explorer-blocks__data-container">
                        <NewIcon
                            iconClass="explorer-blocks__icon"
                            iconWidth={16}
                            iconHeight={16}
                            iconName={"explorer_cwd_amount"}
                        />

                        <span className="explorer-blocks__data">{stealthSupply}</span>
                    </div>
                </div>

                {/* COMMITTEE MEMBERS */}
                <Link
                    className="explorer-blocks__item explorer-blocks__item--button explorer-blocks__item--committee"
                    to={`/account/${currentAccount}/voting/?activeTab=1`}
                >
                    <Translate className="explorer-blocks__title" content="explorer.blocks.active_committee_members" />

                    <div className="explorer-blocks__data-container">
                        <NewIcon
                            iconClass="explorer-blocks__icon"
                            iconWidth={16}
                            iconHeight={16}
                            iconName={"explorer_committee_members"}
                        />

                        <span className="explorer-blocks__data">{committeeMembers}</span>
                    </div>
                </Link>

                {/* MISSED BLOCKS */}
                <div className="explorer-blocks__item explorer-blocks__item">
                    <Translate className="explorer-blocks__title" content="explorer.blocks.recently_missed_blocks" />

                    <div className="explorer-blocks__data-container">
                        <NewIcon
                            iconClass="explorer-blocks__icon"
                            iconWidth={16}
                            iconHeight={16}
                            iconName={"explorer_missed_blocks"}
                        />

                        <span className="explorer-blocks__data">{missedBlocks}</span>
                    </div>
                </div>

                {/* WITNESSES */}
                <Link
                    className="explorer-blocks__item explorer-blocks__item--button explorer-blocks__item--witnesses"
                    to="/witnesses"
                >
                    <div className="explorer-blocks__column-wrap">
                        <div className="explorer-blocks__column">
                            <Translate className="explorer-blocks__title" content="explorer.blocks.active_witnesses" />

                            <div className="explorer-blocks__data-container">
                                <NewIcon
                                    iconClass="explorer-blocks__icon explorer-blocks__icon--large"
                                    iconWidth={20}
                                    iconHeight={20}
                                    iconName={"explorer_witnesses"}
                                />

                                <span className="explorer-blocks__data explorer-blocks__data--large">{activeWitnesses}</span>
                            </div>
                        </div>

                        {deviceWidth > 576 ?
                            <div className="explorer-blocks__column">
                                <Translate className="explorer-blocks__title" content="explorer.witnesses.current" />

                                <LinkToAccountById account={witnessId} noLink />
                            </div>
                            : null}
                    </div>
                </Link>
            </div>
        );
    }
}

export default ExplorerBlocks = connect(ExplorerBlocks, {
    listenTo() {
        return [AccountStore];
    },
    getProps() {
        if (AccountStore.getState().passwordAccount) {
            return {
                currentAccount: ChainStore.fetchFullAccount(
                    AccountStore.getState().passwordAccount
                )
            };
        }
    }
});