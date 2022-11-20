import React from "react";
import Translate from "react-translate-component";
import AccountActions from "actions/AccountActions";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";

//STYLES
import "../scss/poc-voting.scss";

class VotingBlock extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentAccount: this.props.currentAccount,
            term_03: 0,
            term_06: 0,
            term_12: 0
        };
    }

    onAmountChanged(term, e) {
        let amount = parseFloat(e.target.value) || 0;

        if (term == 3) {
            this.setState({
                term_03: amount
            });
        }
        if (term == 6) {
            this.setState({
                term_06: amount
            });
        }
        if (term == 12) {
            this.setState({
                term_12: amount
            });
        }
    }

    isWalletLocked() {
        if (WalletDb.isLocked()) {
            WalletUnlockActions.unlock()
                .then(() => {
                    AccountActions.tryToSetCurrentAccount();
                    this.pocVote();
                })
                .catch(() => {});
        } else {
            this.pocVote();
        }
    }

    pocVote() {
        let accountID = this.props.currentAccount;
        let term_03 = Math.round(this.state.term_03 * 100000);
        let term_06 = Math.round(this.state.term_06 * 100000);
        let term_12 = Math.round(this.state.term_12 * 100000);

        AccountActions.pocVote(accountID, term_03, term_06, term_12).then(
            () => {
                TransactionConfirmStore.unlisten(this.onTrxIncluded);
                TransactionConfirmStore.listen(this.onTrxIncluded);
            }
        );
    }

    render() {
        let term_03 = this.state.term_03;
        let term_06 = this.state.term_06;
        let term_12 = this.state.term_12;

        let isSubmitValid = term_03 > 0 || term_06 > 0 || term_12 > 0;

        return (
            <div className="poc-voting__wrap">
                <div className="poc-voting__header">
                    <Translate
                        className="poc-voting__title"
                        content="proof_of_crowd.poc-voting_title"
                    />

                    <div className="poc-voting__cwd-to-vote">
                        <span>1 CWD = 1%</span>
                    </div>
                </div>

                <div className="poc-form">
                    <div className="poc-form__container">
                        <div className="poc-form__inner">
                            <div className="poc-form__header">
                                <Translate
                                    className="poc-form__label"
                                    content="proof_of_crowd.month_03"
                                />
                                <Translate
                                    className="poc-form__label"
                                    content="proof_of_crowd.month_06"
                                />
                                <Translate
                                    className="poc-form__label"
                                    content="proof_of_crowd.month_12"
                                />
                            </div>

                            <div className="poc-form__body" id="POCInputWrap">
                                <div className="poc-form__field-item">
                                    <input
                                        className="poc-form__field poc-form__field--03"
                                        type="number"
                                        name="month_03"
                                        id="month_03"
                                        placeholder="0"
                                        onChange={this.onAmountChanged.bind(
                                            this,
                                            3
                                        )}
                                    />

                                    <span className="poc-form__asset">CWD</span>
                                </div>

                                <div className="poc-form__field-item">
                                    <input
                                        className="poc-form__field poc-form__field--06"
                                        type="number"
                                        name="month_06"
                                        id="month_06"
                                        placeholder="0"
                                        onChange={this.onAmountChanged.bind(
                                            this,
                                            6
                                        )}
                                    />

                                    <span className="poc-form__asset">CWD</span>
                                </div>

                                <div className="poc-form__field-item">
                                    <input
                                        className="poc-form__field poc-form__field--12"
                                        type="number"
                                        name="month_12"
                                        id="month_12"
                                        placeholder="0"
                                        onChange={this.onAmountChanged.bind(
                                            this,
                                            12
                                        )}
                                    />

                                    <span className="poc-form__asset">CWD</span>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            disabled={!isSubmitValid}
                            onClick={this.isWalletLocked.bind(this)}
                            className="cwd-btn__rounded cwd-btn__rounded--confirm poc-form__vote-btn"
                        >
                            <Translate content="proof_of_crowd.vote_btn" />
                        </button>
                    </div>

                    <Translate
                        className="poc-form__info"
                        component="p"
                        content="proof_of_crowd.form_info"
                    />
                </div>
            </div>
        );
    }
}

export default VotingBlock;
