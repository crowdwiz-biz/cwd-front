import React from "react";
import Translate from "react-translate-component";
import Operation from "../../Blockchain/Operation";
import BlockchainActions from "actions/BlockchainActions";
import utils from "common/utils";
import Immutable from "immutable";
import ChainTypes from "../../Utility/ChainTypes";
import BindToChainState from "../../Utility/BindToChainState";

class BlockchainRecentOps extends React.Component {
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
            trxNumToRernder: 3
        };
    }

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

    showMoreTrxs(num) {
        this.setState({
            trxNumToRernder: num
        });
    }

    render() {
        let latestTransactions = this.props.latestTransactions;
        let transactions = null;
        let trxIndex = 0;
        let trxNumToRernder = parseInt(this.state.trxNumToRernder);

        transactions = latestTransactions
            .sort((a, b) => {
                return b.block_num - a.block_num;
            })
            .take(trxNumToRernder)
            .map(trx => {
                let opIndex = 0;
                return trx.operations
                    .map(op => {
                        return (
                            <Operation
                                key={trxIndex++}
                                op={op}
                                includeOperationId={true}
                                operationId={op.id}
                                result={trx.operation_results[opIndex++]}
                                block={trx.block_num}
                                txIndex={op.trx_in_block}
                                hideFee={true}
                                hideOpLabel={false}
                                current={"1.2.0"}
                                hideDate={true}
                                hidePending={false}
                                fullDate={false}
                                operationsInfo={true}
                                showBlock={true}
                                mainPageMode={true}
                                notificationMode={false}
                            />
                        );
                    })
                    .filter(a => !!a);
            })
            .toArray();

        return (
            <section className="ms-recent-ops__wrap mp-center-wrap">
                <Translate
                    className="mp-common__title"
                    content="main_page.recent_ops.title"
                    component="h2"
                />
                <div className="ms-recent-ops">{transactions}</div>

                <button
                    onClick={this.showMoreTrxs.bind(
                        this,
                        trxNumToRernder == 3 ? 10 : 3
                    )}
                    className="ms-recent-ops__show-more-btn noselct"
                    type="button"
                >
                    {trxNumToRernder == 3 ? (
                        <Translate content="main_page.recent_ops.show_more_btn" />
                    ) : (
                        <Translate content="main_page.recent_ops.show_less_btn" />
                    )}
                </button>
            </section>
        );
    }
}
BlockchainRecentOps = BindToChainState(BlockchainRecentOps, {
    show_loader: true
});

export default BlockchainRecentOps;
