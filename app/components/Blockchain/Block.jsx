import React from "react";
import PropTypes from "prop-types";
import { FormattedDate } from "react-intl";
import BlockchainActions from "actions/BlockchainActions";
import Transaction from "./Transaction";
import Translate from "react-translate-component";
import ChainTypes from "../Utility/ChainTypes";
import BindToChainState from "../Utility/BindToChainState";
import LinkToWitnessById from "../Utility/LinkToWitnessById";
import NewIcon from "../NewIcon/NewIcon";
import counterpart from "counterpart";
import { hash, ops } from "bitsharesjs";
import ls from "common/localStorage";

let ss = new ls("__graphene__");

//STYLES
import "./scss/block-browser.scss";

class TransactionList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showTrxAlert: false
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            nextProps.block.id !== this.props.block.id ||
            nextState.showTrxAlert !== this.state.showTrxAlert
        );
    }

    copyTrxHash() {
        let apiUrl = ss.get("serviceApi");
        let currentTrxHash = this.refs.currentTrxHash.innerText;
        navigator.clipboard.writeText(apiUrl + "/hash/" + currentTrxHash);

        // SHOW ALERT
        this.setState({
            showTrxAlert: true
        });

        this.timer = setTimeout(() => {
            this.setState({ showTrxAlert: false });
        }, 2000);
    }

    render() {
        let { block } = this.props;
        let showTrxAlert = this.state.showTrxAlert;
        let transactions = null;
        transactions = [];

        if (block.transactions.length > 0) {
            transactions = [];

            block.transactions.forEach((trx, index) => {
                let buf2 = ops.transaction.toBuffer(trx)
                // let buf2 = Buffer.from(JSON.stringify(trx))
                let id = hash.sha256(buf2).toString('hex').substring(0, 40);
                transactions.push(
                    <li
                        key={index}
                        id={`tx_${index}`}
                        name={`tx_${index}`}
                        className="transaction__trx-item"
                    >
                        <Transaction key={index} trx={trx} index={index} />

                        <div className="block-browser__info-row block-browser__info-row--tx-id">
                            <span className="block-browser__info-text">TxID: </span>
                            <span
                                className="block-browser__info-data block-browser__info-data--tx-id"
                                onClick={this.copyTrxHash.bind(this)}
                                ref="currentTrxHash">
                                {id}

                                {showTrxAlert ?
                                    <Translate
                                        className="block-browser__alert"
                                        content="address_book.contacs_list.link_copied" />
                                    : null}
                            </span>
                        </div>
                    </li>
                );
            });
        }

        return <ul className="block-browser__trx-list">{transactions}</ul>;
    }
}

class Block extends React.Component {
    static propTypes = {
        dynGlobalObject: ChainTypes.ChainObject.isRequired,
        blocks: PropTypes.object.isRequired,
        height: PropTypes.number.isRequired
    };

    static defaultProps = {
        dynGlobalObject: "2.1.0",
        blocks: {},
        height: 1
    };

    constructor(props) {
        super(props);

        this.state = {
            showAlert: false
        }
    }

    componentDidMount() {
        this._getBlock(this.props.height);
    }

    UNSAFE_componentWillReceiveProps(np) {
        if (np.height !== this.props.height) {
            this._getBlock(np.height);
        }
    }

    _getBlock(height) {
        if (height) {
            height = parseInt(height, 10);
            if (!this.props.blocks.get(height)) {
                BlockchainActions.getBlock(height);
            }
        }
    }

    _nextBlock() {
        let height = this.props.match.params.height;
        let nextBlock = Math.min(
            this.props.dynGlobalObject.get("head_block_number"),
            parseInt(height, 10) + 1
        );
        this.props.history.push(`/block/${nextBlock}`);
    }

    _previousBlock() {
        let height = this.props.match.params.height;
        let previousBlock = Math.max(1, parseInt(height, 10) - 1);
        this.props.history.push(`/block/${previousBlock}`);
    }

    _onKeyDown(e) {
        if (e && e.keyCode === 13) {
            this.props.history.push(`/block/${e.target.value}`);
        }
    }

    goToBlock() {
        const value = this.refs.blockInput.value;
        if (value) {
            this._onKeyDown({ keyCode: 13, target: { value } });
        }
    }

    copyBlockHash() {
        let apiUrl = ss.get("serviceApi");
        let currentBlockHash = this.refs.currentBlockHash.innerText;
        navigator.clipboard.writeText(apiUrl + "/block/" + currentBlockHash);

        // SHOW ALERT
        this.setState({
            showAlert: true
        });

        this.timer = setTimeout(() => {
            this.setState({ showAlert: false });
        }, 2000);
    }

    render() {
        let { blocks } = this.props;
        let height = parseInt(this.props.height, 10);
        let block = blocks.get(height);
        let blockID = "";
        let { showAlert } = this.state;

        if (block) {
            let blockHeader = Object.assign({}, block);
            delete blockHeader.transactions
            let buf1 = ops.signed_block_header.toBuffer(blockHeader)
            var createHash = require('create-hash')
            var hashId = createHash('sha224')
            hashId.update(buf1)
            blockID = block.id.toString(16).padStart(8, "0") + hashId.digest().toString('hex').substring(8, 40)
        }

        return (
            <section className="cwd-common__wrap">
                <div className="block-browser">

                    {/* TITLE */}
                    <div className="block-browser__header">
                        <span className="cwd-common__title">
                            <Translate content="explorer.block.title" />
                            &nbsp;
                            <span>#{height}</span>
                        </span>
                    </div>

                    {/* BLOCK INFO */}
                    <div className="block-browser__info-wrap">
                        <div className="block-browser__info-row block-browser__info-row--hash">
                            <span className="block-browser__info-text">
                                <Translate
                                    component="span"
                                    content="explorer.block.id"
                                />&#58;
                            </span>

                            <div className="block-browser__alert-wrap">
                                <span
                                    className="block-browser__info-data block-browser__info-data--copy-hash" onClick={this.copyBlockHash.bind(this)}
                                    ref="currentBlockHash"
                                >
                                    {block ? blockID : null}
                                </span>

                                {showAlert ?
                                    <Translate
                                        className="block-browser__alert"
                                        content="address_book.contacs_list.link_copied" />
                                    : null}
                            </div>
                        </div>

                        <div className="block-browser__info-row">
                            <span className="block-browser__info-text">
                                <Translate
                                    component="span"
                                    content="explorer.block.date"
                                />&#58;
                            </span>

                            <span className="block-browser__info-data">
                                {block ?
                                    <FormattedDate
                                        value={block.timestamp}
                                        format="full"
                                    />
                                    : null}
                            </span>
                        </div>

                        <div className="block-browser__info-row">
                            <span className="block-browser__info-text">
                                <Translate
                                    component="span"
                                    content="explorer.block.witness"
                                />&#58;
                            </span>

                            <span className="block-browser__info-data">
                                {block ?
                                    <LinkToWitnessById
                                        witness={block.witness}
                                    />
                                    : null}
                            </span>
                        </div>

                        <div className="block-browser__info-row block-browser__info-row--hash">
                            <span className="block-browser__info-text">
                                <Translate
                                    component="span"
                                    content="explorer.block.previous"
                                />
                            </span>

                            <span className="block-browser__info-data">
                                {block ? block.previous : null}
                            </span>
                        </div>

                        <div className="block-browser__info-row">
                            <span className="block-browser__info-text">
                                <Translate
                                    component="span"
                                    content="explorer.block.transactions"
                                />
                            </span>

                            <span className="block-browser__info-data">
                                {block ?
                                    block.transactions.length
                                    : null}
                            </span>
                        </div>
                    </div>

                    <div className="block-browser__btn-container">

                        {/* PAGINATION */}
                        <div className="block-browser__pagination-wrap">
                            <button
                                type="button"
                                className="cwd-btn__action-btn noselect"
                                onClick={this._previousBlock.bind(this)}
                            >

                                <NewIcon
                                    iconWidth={16}
                                    iconHeight={13}
                                    iconClass="block-browser__prew-btn"
                                    iconName={"link_btn_arrow"}
                                />
                                <Translate content="pagination.page-prew" />
                            </button>

                            <button
                                type="button"
                                className="cwd-btn__action-btn noselect"
                                onClick={this._nextBlock.bind(this)}
                            >
                                <Translate content="pagination.page-next" />

                                <NewIcon
                                    iconWidth={16}
                                    iconHeight={13}
                                    iconName={"link_btn_arrow"}
                                />
                            </button>
                        </div>

                        {/* GO TO BLOCK */}
                        <div className="block-browser__searching-wrap">
                            <div className="block-browser__searching-inner">
                                <input
                                    className="cwd-common__input"
                                    type="text"
                                    ref="blockInput"
                                    onKeyDown={this._onKeyDown.bind(this)}
                                    placeholder={counterpart.translate("explorer.block.go_to")}
                                />

                                <button
                                    type="button"
                                    className="cwd-btn__action-btn block-browser__btn noselect"
                                    onClick={this.goToBlock.bind(this)}
                                >
                                    <Translate content="explorer.block.go_to_btn" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* BLOCK TRX */}
                    {block && block.transactions.length > 0 ?
                        <TransactionList block={block} /> :
                        <Translate content="explorer.block.no_trx" />
                    }
                </div>
            </section>
        );
    }
}

export default BindToChainState(Block);
