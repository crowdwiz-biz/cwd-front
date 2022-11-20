import React from "react";
import {connect} from "alt-react";
import ApplicationApi from "api/ApplicationApi";
import AccountStore from "stores/AccountStore";
import utils from "common/utils";
import Translate from "react-translate-component";
import counterpart from "counterpart";
import {Notification} from "crowdwiz-ui-modal";

class CreateWorker extends React.Component {
    constructor() {
        super();

        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);

        this.state = {
            title: null,
            start: new Date(),
            end: null,
            pay: null,
            url: "http://",
            vesting: 7,
            hint: "",
            hintName: "",
            showHint: false,
            width: 0,
            height: 0
        };
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener("resize", this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateWindowDimensions);
    }

    updateWindowDimensions() {
        this.setState({width: window.innerWidth, height: window.innerHeight});
    }

    shouldComponentUpdate(np, ns) {
        return (
            np.currentAccount !== this.props.currentAccount,
            !utils.are_equal_shallow(ns, this.state)
        );
    }

    onSubmit(e) {
        e.preventDefault();
        ApplicationApi.createWorker(
            this.state,
            this.props.currentAccount
        ).catch(error => {
            console.log("error", error);
            let error_msg =
                error.message &&
                error.message.length &&
                error.message.length > 0
                    ? error.message.split("stack")[0]
                    : "unknown error";

            Notification.error({
                message: counterpart.translate(
                    "notifications.worker_create_failure",
                    {
                        error_msg: error_msg
                    }
                )
            });
        });
    }

    showHint(e) {
        let hints = {
            name: "explorer.workers.name_text",
            date: "explorer.workers.date_text",
            pay: "explorer.workers.pay_text",
            vesting: "explorer.workers.vesting_text",
            website: "explorer.workers.url_text"
        };

        for (var key in hints) {
            if (key === e.target.getAttribute("name")) {
                this.setState({showHint: true});
                this.setState({hint: hints[key]});
                this.setState({hintName: key});
            }
        }
    }

    render() {
        return (
            <div className="grid-block" style={{paddingTop: 20}}>
                <div className="grid-content large-12 small-12">
                    <div className="create-worker">
                        <div className="create-worker__description">
                            <Translate
                                content="explorer.workers.create"
                                component="h3"
                            />
                            <Translate
                                content="explorer.workers.create_text_1"
                                component="p"
                            />
                            <Translate
                                content="explorer.workers.create_text_2"
                                component="p"
                                className="create-worker__p"
                            />
                            {this.state.showHint && this.state.width > 768 ? (
                                <Translate
                                    content={this.state.hint}
                                    component="p"
                                    className="create-worker__hint"
                                />
                            ) : null}
                        </div>

                        <form className="create-worker__form">
                            <label>
                                <Translate
                                    content="explorer.workers.title"
                                    className="create-worker__label"
                                />
                                <input
                                    onChange={e => {
                                        this.setState({title: e.target.value});
                                    }}
                                    onFocus={e => this.showHint(e)}
                                    onBlur={() =>
                                        this.setState({showHint: false})
                                    }
                                    type="text"
                                    className="cwd-input create-worker__name"
                                    name="name"
                                />
                                {this.state.showHint &&
                                this.state.width < 768 &&
                                this.state.hintName === "name" ? (
                                    <Translate
                                        content={this.state.hint}
                                        component="p"
                                        className="create-worker__mob-hint"
                                    />
                                ) : null}
                            </label>
                            <div className="create-worker__two-inputs">
                                <label>
                                    <Translate
                                        content="account.votes.start"
                                        className="create-worker__label"
                                    />
                                    <input
                                        onChange={e => {
                                            this.setState({
                                                start: new Date(e.target.value)
                                            });
                                        }}
                                        onFocus={e => this.showHint(e)}
                                        onBlur={() =>
                                            this.setState({showHint: false})
                                        }
                                        type="date"
                                        className="cwd-input"
                                        name="date"
                                    />
                                </label>
                                <label>
                                    <Translate
                                        content="account.votes.end"
                                        className="create-worker__label"
                                    />
                                    <input
                                        onChange={e => {
                                            this.setState({
                                                end: new Date(e.target.value)
                                            });
                                        }}
                                        onFocus={e => this.showHint(e)}
                                        onBlur={() =>
                                            this.setState({showHint: false})
                                        }
                                        type="date"
                                        className="cwd-input"
                                        name="date"
                                    />
                                    {this.state.showHint &&
                                    this.state.width < 768 &&
                                    this.state.hintName === "date" ? (
                                        <Translate
                                            content={this.state.hint}
                                            component="p"
                                            className="create-worker__mob-hint create-worker__mob-hint--date"
                                        />
                                    ) : null}
                                </label>
                            </div>
                            <div className="create-worker__two-inputs">
                                <label>
                                    <Translate
                                        content="explorer.workers.daily_pay"
                                        className="create-worker__label"
                                    />
                                    <input
                                        onChange={e => {
                                            this.setState({
                                                pay: e.target.value
                                            });
                                        }}
                                        onFocus={e => this.showHint(e)}
                                        onBlur={() =>
                                            this.setState({showHint: false})
                                        }
                                        type="number"
                                        className="cwd-input"
                                        name="pay"
                                    />
                                    {this.state.showHint &&
                                    this.state.width < 768 &&
                                    this.state.hintName === "pay" ? (
                                        <Translate
                                            content={this.state.hint}
                                            component="p"
                                            className="create-worker__mob-hint create-worker__mob-hint--pay"
                                        />
                                    ) : null}
                                </label>
                                <label>
                                    <Translate
                                        content="explorer.workers.vesting_pay"
                                        className="create-worker__label"
                                    />
                                    <input
                                        defaultValue={this.state.vesting}
                                        onChange={e => {
                                            this.setState({
                                                vesting: parseInt(
                                                    e.target.value
                                                )
                                            });
                                        }}
                                        onFocus={e => this.showHint(e)}
                                        onBlur={() =>
                                            this.setState({showHint: false})
                                        }
                                        type="number"
                                        className="cwd-input"
                                        name="vesting"
                                    />
                                    {this.state.showHint &&
                                    this.state.width < 768 &&
                                    this.state.hintName === "vesting" ? (
                                        <Translate
                                            content={this.state.hint}
                                            component="p"
                                            className="create-worker__mob-hint create-worker__mob-hint--vesting"
                                        />
                                    ) : null}
                                </label>
                            </div>
                            <label className="create-worker__last-label">
                                <Translate
                                    content="explorer.workers.website"
                                    className="create-worker__label"
                                />
                                <input
                                    onChange={e => {
                                        this.setState({url: e.target.value});
                                    }}
                                    onFocus={e => this.showHint(e)}
                                    onBlur={() =>
                                        this.setState({showHint: false})
                                    }
                                    type="text"
                                    className="cwd-input"
                                    name="website"
                                />
                                {this.state.showHint &&
                                this.state.width < 768 &&
                                this.state.hintName === "website" ? (
                                    <Translate
                                        content={this.state.hint}
                                        component="p"
                                        className="create-worker__mob-hint create-worker__mob-hint--website"
                                    />
                                ) : null}
                            </label>
                            <div className="create-worker__footer">
                                <Translate
                                    onClick={e => this.onSubmit(e)}
                                    content="wallet.create"
                                    component="button"
                                    className="common-btn create-worker__submit-btn"
                                    type="submit"
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

export default CreateWorker = connect(CreateWorker, {
    listenTo() {
        return [AccountStore];
    },
    getProps() {
        return {
            currentAccount: AccountStore.getState().currentAccount
        };
    }
});
