import React from "react";
import counterpart from "counterpart";
import Translate from "react-translate-component";
import utils from "common/utils";
import ChainTypes from "../Utility/ChainTypes";
import FormattedAsset from "../Utility/FormattedAsset";
import LinkToAccountById from "../Utility/LinkToAccountById";
import BindToChainState from "../Utility/BindToChainState";
import {EquivalentValueComponent} from "../Utility/EquivalentValueComponent";
import AssetName from "../Utility/AssetName";
import NewIcon from "components/NewIcon/NewIcon";
import PropTypes from "prop-types";

class WorkerApproval extends React.Component {
    static propTypes = {
        worker: ChainTypes.ChainObject.isRequired,
        onAddVote: PropTypes.func, /// called with vote id to add
        onRemoveVote: PropTypes.func, /// called with vote id to remove
        vote_ids: PropTypes.object /// Set of items currently being voted for
    };

    static defaultProps = {
        tempComponent: "tr"
    };

    constructor(props) {
        super(props);
    }

    onApprove() {
        let addVotes = [],
            removeVotes = [];

        if (this.props.vote_ids.has(this.props.worker.get("vote_against"))) {
            removeVotes.push(this.props.worker.get("vote_against"));
        }

        if (!this.props.vote_ids.has(this.props.worker.get("vote_for"))) {
            addVotes.push(this.props.worker.get("vote_for"));
        }

        this.props.onChangeVotes(addVotes, removeVotes);
    }

    onReject() {
        let addVotes = [],
            removeVotes = [];

        if (this.props.vote_ids.has(this.props.worker.get("vote_against"))) {
            removeVotes.push(this.props.worker.get("vote_against"));
        }

        if (this.props.vote_ids.has(this.props.worker.get("vote_for"))) {
            removeVotes.push(this.props.worker.get("vote_for"));
        }

        this.props.onChangeVotes(addVotes, removeVotes);
    }

    render() {
        let {rank} = this.props;
        let worker = this.props.worker.toJS();
        let total_votes = worker.total_votes_for - worker.total_votes_against;
        let approvalState = this.props.vote_ids.has(worker.vote_for)
            ? true
            : this.props.vote_ids.has(worker.vote_against)
            ? false
            : null;

        let fundedPercent = 0;

        if (worker.daily_pay < this.props.rest) {
            fundedPercent = 100;
        } else if (this.props.rest > 0) {
            fundedPercent = (this.props.rest / worker.daily_pay) * 100;
        }

        let startDate = counterpart.localize(
            new Date(worker.work_begin_date + "Z"),
            {type: "date", format: "short_custom"}
        );
        let endDate = counterpart.localize(
            new Date(worker.work_end_date + "Z"),
            {type: "date", format: "short_custom"}
        );

        let now = new Date();
        let isExpired = new Date(worker.work_end_date + "Z") <= now;
        let hasStarted = new Date(worker.work_begin_date + "Z") <= now;
        let isProposed =
            (!isExpired && total_votes < this.props.voteThreshold) ||
            !hasStarted;
        return (
            <React.Fragment>
                <tr
                    className={approvalState ? "" : "unsupported"}
                    id="list-desctop"
                >
                    {isExpired ? null : (
                        <td
                            style={{
                                textAlign: "right",
                                paddingRight: 10,
                                paddingLeft: 0
                            }}
                        >
                            {rank}
                        </td>
                    )}

                    <td className="worker-id" style={{textAlign: "left"}}>
                        {worker.id}
                    </td>

                    <td className="worker-name" style={{textAlign: "left"}}>
                        <div
                            className="inline-block"
                            style={{
                                paddingRight: 5,
                                position: "relative",
                                top: -1
                            }}
                        >
                            <a
                                style={{
                                    visibility:
                                        worker.url &&
                                        worker.url.indexOf(".") !== -1
                                            ? "visible"
                                            : "hidden"
                                }}
                                href={worker.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <NewIcon
                                    iconWidth={16}
                                    iconHeight={16}
                                    iconName={"witness-link"}
                                />
                            </a>
                        </div>
                        <div className="inline-block">
                            {worker.name}
                            <br />
                            <LinkToAccountById
                                account={worker.worker_account}
                            />
                        </div>
                    </td>

                    <td
                        style={{textAlign: "right"}}
                        className="hide-column-small"
                    >
                        <FormattedAsset
                            amount={total_votes}
                            asset="1.3.0"
                            decimalOffset={5}
                            hide_asset
                        />
                    </td>

                    {!isProposed ? null : (
                        <td style={{textAlign: "right"}}>
                            <FormattedAsset
                                amount={Math.max(
                                    0,
                                    this.props.voteThreshold - total_votes
                                )}
                                asset="1.3.0"
                                hide_asset
                                decimalOffset={5}
                            />
                        </td>
                    )}

                    <td>
                        {startDate} - {endDate}
                    </td>

                    {isExpired || isProposed ? null : (
                        <td
                            style={{textAlign: "right"}}
                            className="hide-column-small"
                        >
                            {utils.format_number(fundedPercent, 2)}%
                        </td>
                    )}

                    <td
                        style={{textAlign: "right"}}
                        className="hide-column-small"
                    >
                        <EquivalentValueComponent
                            hide_asset
                            fromAsset="1.3.0"
                            toAsset={this.props.preferredUnit}
                            amount={worker.daily_pay}
                        />
                    </td>

                    {isExpired || isProposed ? null : (
                        <td style={{textAlign: "right"}}>
                            {this.props.rest <= 0 ? (
                                "0.00"
                            ) : (
                                <EquivalentValueComponent
                                    hide_asset
                                    fromAsset="1.3.0"
                                    toAsset={this.props.preferredUnit}
                                    amount={this.props.rest}
                                />
                            )}
                        </td>
                    )}

                    <td
                        className="clickable"
                        onClick={
                            this.props.proxy
                                ? () => {}
                                : this[
                                      approvalState ? "onReject" : "onApprove"
                                  ].bind(this)
                        }
                    >
                        {!this.props.proxy ? (
                            <NewIcon
                                iconClass={
                                    approvalState ? "voting__vote-mark" : null
                                }
                                iconWidth={16}
                                iconHeight={16}
                                iconName={
                                    approvalState
                                        ? "checkmark-circle"
                                        : "minus-circle"
                                }
                            />
                        ) : (
                            <NewIcon
                                iconWidth={16}
                                iconHeight={16}
                                iconName={"locked"}
                            />
                        )}
                    </td>
                </tr>

                <div
                    id="votingCard"
                    style={{display: "flex", flexDirection: "column"}}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                            height: "25%"
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column"
                                }}
                            >
                                <span>{worker.name}</span>
                                <LinkToAccountById
                                    account={worker.worker_account}
                                />
                            </div>
                        </div>

                        <div
                            className="clickable"
                            onClick={
                                this.props.proxy
                                    ? () => {}
                                    : this[
                                          approvalState
                                              ? "onReject"
                                              : "onApprove"
                                      ].bind(this)
                            }
                        >
                            {!this.props.proxy ? (
                                <NewIcon
                                    iconClass={
                                        approvalState
                                            ? "voting__vote-mark"
                                            : null
                                    }
                                    iconWidth={16}
                                    iconHeight={16}
                                    iconName={
                                        approvalState
                                            ? "checkmark-circle"
                                            : "minus-circle"
                                    }
                                />
                            ) : (
                                <NewIcon
                                    iconWidth={16}
                                    iconHeight={16}
                                    iconName={"locked"}
                                />
                            )}
                        </div>
                    </div>

                    <div
                        style={{display: "flex", width: "100%", height: "30%"}}
                    >
                        <div
                            style={{
                                display: "flex",
                                width: "33%",
                                height: "100%",
                                flexDirection: "column"
                            }}
                        >
                            <Translate content="account.votes.daily_pay" />
                            <span>
                                <EquivalentValueComponent
                                    hide_asset
                                    fromAsset="1.3.0"
                                    toAsset={this.props.preferredUnit}
                                    amount={worker.daily_pay}
                                />
                                <AssetName name={this.props.preferredUnit} />
                            </span>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                width: "33%",
                                height: "100%",
                                flexDirection: "column"
                            }}
                        >
                            <Translate content="account.votes.total_votes" />
                            <span>
                                <FormattedAsset
                                    amount={total_votes}
                                    asset="1.3.0"
                                    decimalOffset={5}
                                    hide_asset
                                />
                            </span>

                            {!isProposed ? null : (
                                <div>
                                    <FormattedAsset
                                        amount={Math.max(
                                            0,
                                            this.props.voteThreshold -
                                                total_votes
                                        )}
                                        asset="1.3.0"
                                        hide_asset
                                        decimalOffset={5}
                                    />
                                </div>
                            )}
                        </div>

                        <div
                            style={{
                                display: "flex",
                                width: "33%",
                                height: "100%",
                                flexDirection: "column"
                            }}
                        >
                            <Translate content="explorer.workers.period" />
                            <span>
                                {startDate}
                                <br />
                                {endDate}
                            </span>
                        </div>
                    </div>

                    <div
                        style={{display: "flex", width: "100%", height: "30%"}}
                    >
                        <div
                            style={{
                                display: "flex",
                                width: "33%",
                                height: "100%",
                                flexDirection: "column"
                            }}
                        >
                            <Translate content="account.votes.line" />
                            {isExpired ? null : <span>{rank}</span>}
                        </div>

                        <div
                            style={{
                                display: "flex",
                                width: "33%",
                                height: "100%",
                                flexDirection: "column"
                            }}
                        >
                            <span>ID</span>
                            <span>{worker.id}</span>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                width: "33%",
                                height: "100%",
                                flexDirection: "column"
                            }}
                        >
                            <Translate content="explorer.witnesses.budget" />
                            {isExpired || isProposed ? null : (
                                <span>
                                    {this.props.rest <= 0 ? (
                                        "0.00"
                                    ) : (
                                        <EquivalentValueComponent
                                            hide_asset
                                            fromAsset="1.3.0"
                                            toAsset={this.props.preferredUnit}
                                            amount={this.props.rest}
                                        />
                                    )}
                                </span>
                            )}
                        </div>
                    </div>

                    <div
                        style={{display: "flex", width: "100%", height: "15%"}}
                    >
                        <div style={{width: "66%"}}>
                            <Translate content="account.votes.funding" />
                            {isExpired || isProposed ? null : (
                                <span>
                                    {utils.format_number(fundedPercent, 2)}%
                                </span>
                            )}
                        </div>

                        <div style={{width: "33%"}}>
                            <NewIcon
                                iconWidth={16}
                                iconHeight={16}
                                iconName={"witness-link"}
                            />
                            <a
                                style={{
                                    visibility:
                                        worker.url &&
                                        worker.url.indexOf(".") !== -1
                                            ? "visible"
                                            : "hidden"
                                }}
                                href={worker.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Translate content="icons.share" />
                            </a>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default BindToChainState(WorkerApproval);
