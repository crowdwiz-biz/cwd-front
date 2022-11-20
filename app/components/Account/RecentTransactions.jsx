import React from "react";
import Translate from "react-translate-component";
import Operation from "../Blockchain/Operation";
import ChainTypes from "../Utility/ChainTypes";
import BindToChainState from "../Utility/BindToChainState";
import utils from "common/utils";
import { ChainTypes as grapheneChainTypes } from "bitsharesjs";
import ps from "perfect-scrollbar";
import counterpart from "counterpart";
import cnames from "classnames";
import PropTypes from "prop-types";
import PaginatedList from "../Utility/PaginatedList";
const { operations } = grapheneChainTypes;
const alignLeft = { textAlign: "left" };
import LoadingIndicator from "../LoadingIndicator";
import { Tooltip } from "crowdwiz-ui-modal";

const ops = Object.keys(operations);

function compareOps(b, a) {
    if (a.block_num === b.block_num) {
        return a.virtual_op - b.virtual_op;
    } else {
        return a.block_num - b.block_num;
    }
}

class RecentTransactions extends React.Component {
    static propTypes = {
        accountsList: ChainTypes.ChainAccountsList.isRequired,
        compactView: PropTypes.bool,
        limit: PropTypes.number,
        maxHeight: PropTypes.number,
        fullHeight: PropTypes.bool,
        showFilters: PropTypes.bool
    };

    static defaultProps = {
        limit: 25,
        maxHeight: 500,
        fullHeight: false,
        showFilters: false
    };

    constructor(props) {
        super();
        this.state = {
            limit: props.limit,
            fetchingAccountHistory: false,
            headerHeight: 85,
            filter: "all",
            accountHistoryError: false
        };
    }

    componentDidMount() {
        if (!this.props.fullHeight) {
            let t = this.refs.transactions;
            ps.initialize(t);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (
            !utils.are_equal_shallow(
                this.props.accountsList,
                nextProps.accountsList
            )
        )
            return true;
        if (this.props.maxHeight !== nextProps.maxHeight) return true;
        if (this.state.headerHeight !== nextState.headerHeight) return true;
        if (this.state.filter !== nextState.filter) return true;
        if (this.props.customFilter) {
            if (
                !utils.are_equal_shallow(
                    this.props.customFilter.fields,
                    nextProps.customFilter.fields
                ) ||
                !utils.are_equal_shallow(
                    this.props.customFilter.values,
                    nextProps.customFilter.values
                )
            ) {
                return true;
            }
        }

        if (this.props.maxHeight !== nextProps.maxHeight) return true;
        if (
            nextState.limit !== this.state.limit ||
            nextState.fetchingAccountHistory !==
            this.state.fetchingAccountHistory
        )
            return true;
        for (let key = 0; key < nextProps.accountsList.length; ++key) {
            let npa = nextProps.accountsList[key];
            let nsa = this.props.accountsList[key];
            if (npa && nsa && npa.get("history") !== nsa.get("history"))
                return true;
        }
        return false;
    }

    _onIncreaseLimit() {
        this.setState({
            limit: this.state.limit + 30
        });
    }

    _getHistory(accountsList, filterOp, customFilter, multiFilter) {
        let history = [];
        let seen_ops = new Set();
        for (let account of accountsList) {
            if (account) {
                let h = account.get("history");
                if (h)
                    history = history.concat(
                        h
                            .toJS()
                            .filter(
                                op =>
                                    !seen_ops.has(op.id) && seen_ops.add(op.id)
                            )
                    );
            }
        }
        if (filterOp) {
            history = history.filter(a => {
                return a.op[0] === operations[filterOp];
            });
        }
        if (multiFilter) {
            history = history.filter(a => {
                return multiFilter.indexOf(a.op[0]) !== -1;
            });
        }

        if (customFilter) {
            history = history.filter(a => {
                let finalValue = customFilter.fields.reduce((final, filter) => {
                    switch (filter) {
                        case "asset_id":
                            return (
                                final &&
                                a.op[1]["amount"][filter] ===
                                customFilter.values[filter]
                            );
                            break;
                        default:
                            return (
                                final &&
                                a.op[1][filter] === customFilter.values[filter]
                            );
                            break;
                    }
                }, true);
                return finalValue;
            });
        }
        return history;
    }

    _onChangeFilter(e) {
        this.setState({
            filter: e.target.value
        });
    }

    render() {
        let {
            accountsList,
            compactView,
            filter,
            customFilter,
            style,
            maxHeight,
            shortMode
        } = this.props;

        let multiFilter = this.props.multiFilter;
        let gamezoneView = this.props.gamezoneView;

        let { limit, headerHeight } = this.state;
        let current_account_id =
            accountsList.length === 1 && accountsList[0]
                ? accountsList[0].get("id")
                : null;


        let history = this._getHistory(
            accountsList,
            this.props.showFilters && this.state.filter !== "all"
                ? this.state.filter
                : filter,
            customFilter,
            multiFilter
        ).sort(compareOps);
        let historyCount = history.length;

        style = style ? style : { width: "100%", height: "100%" };

        let options = null;
        if (true || this.props.showFilters) {
            options = [
                "all",
                "account_status_upgrade",
                "transfer",
                "send_message",
                "matrix_open_room",
                "matrix_room_closed",
                "matrix_cell_filled",
                "limit_order_create",
                "limit_order_cancel",
                "fill_order",
                "account_create",
                "account_update",
                "asset_create",
                "witness_withdraw_pay",
                "vesting_balance_withdraw",
                "flipcoin_bet",
                "flipcoin_call",
                "flipcoin_win",
                "flipcoin_cancel",
                "flipcoin_loose",
                "lottery_goods_create_lot",
                "lottery_goods_buy_ticket",
                "lottery_goods_send_contacts",
                "lottery_goods_confirm_delivery",
                "lottery_goods_win",
                "lottery_goods_loose",
                "lottery_goods_refund",
                "create_p2p_adv",
                "edit_p2p_adv",
                "clear_p2p_adv_black_list",
                "remove_from_p2p_adv_black_list",
                "create_p2p_order",
                "cancel_p2p_order",
                "autocancel_p2p_order",
                "autorefund_p2p_order",
                "call_p2p_order",
                "payment_p2p_order",
                "release_p2p_order",
                "open_p2p_dispute",
                "reply_p2p_dispute",
                "resolve_p2p_dispute",
                "credit_system_get",
                "credit_total_repay",
                "credit_repay",
                "credit_offer_create",
                "credit_offer_cancel",
                "credit_offer_fill",
                "pledge_offer_give_create",
                "pledge_offer_take_create",
                "pledge_offer_cancel",
                "pledge_offer_fill",
                "pledge_offer_repay",
                "pledge_offer_auto_repay",
                "poc_vote",
                "exchange_silver",
                "poc_stak",
                "poc_staking_referal",
                "buy_gcwd",
                "change_referrer",
                "gr_team_create",
                "gr_team_delete",
                "gr_invite_send",
                "gr_invite_accept",
                "gr_player_remove",
                "gr_team_leave",
                "gr_vote",
                "gr_assign_rank",
                "gr_pay_rank_reward",
                "gr_pay_top_reward",
                "gr_apostolos",
                "gr_range_bet",
                "gr_team_bet",
                "gr_range_bet_win",
                "gr_range_bet_loose",
                "gr_team_bet_win",
                "gr_team_bet_loose",
                "gr_range_bet_cancel",
                "gr_team_bet_cancel"
            ].map(type => {
                return (
                    <option value={type} key={type}>
                        {counterpart.translate("transaction.trxTypes." + type)}
                    </option>
                );
            });
        }



        let hideFee = false;
        if (this.props.gamezoneView) hideFee = true;
        let display_history = history.length
            ? history.slice(0, limit).map((o, i) => {
                return (
                    <Operation
                        includeOperationId={true}
                        operationId={o.id}
                        style={alignLeft}
                        key={o.id}
                        op={o.op}
                        result={o.result}
                        txIndex={o.trx_in_block}
                        block={o.block_num}
                        current={current_account_id}
                        hideFee={hideFee}
                        inverted={false}
                        hideOpLabel={compactView}
                        fullDate={true}
                        operationsInfo={true}
                        mainPageMode={false}
                        notificationMode={false}
                        shortMode={shortMode}
                    />
                );
            })
            : [
                <Translate
                    key="no_recent"
                    className="operations__no-recent"
                    content="operation.no_recent"
                    component="div"
                />
            ];

        let showHeader = true;
        if (display_history[0]["key"] == "no_recent") {
            showHeader = false;
        }

        return (
            <div className="recent-transactions" style={style}>
                <div className="generic-bordered-box">
                    <div className="header-selector">
                        <div className="selector">
                            <div className={cnames("inline-block")}>
                                {this.props.showFilters ? (
                                    <Tooltip
                                        placement="bottom"
                                        title={counterpart.translate(
                                            "tooltip.filter_ops"
                                        )}
                                    >
                                        <select
                                            style={{
                                                paddingTop: 5
                                            }}
                                            className="cwd-select"
                                            value={this.state.filter}
                                            onChange={this._onChangeFilter.bind(
                                                this
                                            )}
                                        >
                                            {options}
                                        </select>
                                    </Tooltip>
                                ) : null}
                            </div>
                        </div>
                        {this.state.accountHistoryError && (
                            <div
                                className="has-error"
                                style={{ paddingLeft: "0.75rem" }}
                            >
                                <Translate content="account.history_error" />
                            </div>
                        )}
                    </div>
                    <div
                        className="box-content no-margin"
                        style={
                            !this.props.fullHeight
                                ? {
                                    maxHeight: maxHeight - headerHeight
                                }
                                : null
                        }
                        ref="transactions"
                    >
                        <PaginatedList
                            withTransition
                            paginatedWrap="operation__wrap"
                            rows={display_history}
                            label="utility.total_x_operations"
                        />
                    </div>
                    {this.state.fetchingAccountHistory && <LoadingIndicator />}
                </div>
            </div>
        );
    }
}
RecentTransactions = BindToChainState(RecentTransactions);

class TransactionWrapper extends React.Component {
    static propTypes = {
        asset: ChainTypes.ChainAsset.isRequired,
        to: ChainTypes.ChainAccount.isRequired,
        fromAccount: ChainTypes.ChainAccount.isRequired
    };

    static defaultProps = {
        asset: "1.3.0"
    };

    render() {
        return (
            <span className="wrapper">{this.props.children(this.props)}</span>
        );
    }
}
TransactionWrapper = BindToChainState(TransactionWrapper);

export { RecentTransactions, TransactionWrapper };
