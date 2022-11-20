import React from "react";
import Translate from "react-translate-component";
import LoadingIndicator from "../LoadingIndicator";
import AccountStructureItem from "./AccountStructureItem";
import {Link} from "react-router-dom";
import {Progress} from "react-sweet-progress";
import "react-sweet-progress/lib/style.css";
import counterpart from "counterpart";
import {ChainStore} from "bitsharesjs";
import AccountStore from "stores/AccountStore";
import {connect} from "alt-react";

require("./scss/structure-proposal.scss");

class AccountStructure extends React.Component {
    constructor(props, context) {
        super(props);

        this.last_path = null;

        this.state = {
            userRef: "",
            structData: {},
            contractData: [],
            activeOnly: true,
            findAccount: "",
            isProposal: false
        };
        this.getStructure = this.getStructure.bind(this);
        this.showUnactive = this.showUnactive.bind(this);
    }

    UNSAFE_componentWillMount() {
        this.getStructure(this.props.account.get("id"));
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (this.props.account.get("id") != newProps.account.get("id")) {
            this.setState(
                {
                    userRef: "",
                    structData: {},
                    contractData: []
                },
                () => {
                    this.getStructure(newProps.account.get("id"));
                }
            );
        }
    }

    getStructure(acc_id) {
        let apiUrl = this.props.apiUrl;
        let pass_account;
        let structureUrl;

        if (this.props.pass_account) {
            pass_account = this.props.pass_account.get("id");

            if (this.state.activeOnly) {
                structureUrl = apiUrl + "/structure/" + acc_id + "-p.json";
            } else {
                structureUrl = apiUrl + "/structure/" + acc_id + "-c.json";
            }

            fetch(structureUrl)
                .then(response => response.json())
                .then(data => {
                    this.setState({
                        structData: data,
                        userRef: data["referrer_name"]
                    });
                    if (this.state.structData["firstline"]) {
                        let partnersFilter = this.state.structData["firstline"];
                        let partnersName = [];

                        for (var i = 0; i < partnersFilter.length; i++) {
                            partnersName.push(partnersFilter[i]["name"]);
                        }
                        this.setState({
                            partnersName: partnersName
                        });
                    }
                    let accountName = this.state.structData["name"];

                    let proposeAcc = ChainStore.fetchFullAccount(accountName);
                    let allowed_accs = [];
                    let account_auth = proposeAcc
                        .get("active")
                        .get("account_auths");

                    account_auth.forEach(element => {
                        allowed_accs.push(element.get(0));
                    });

                    if (allowed_accs.indexOf(pass_account) != -1) {
                        this.setState({
                            isProposal: true
                        });
                    } else {
                        this.setState({
                            isProposal: false
                        });
                    }
                });
        } else {
            this.props.history.push("/create-account/password");
        }
    }

    showUnactive() {
        let checked = this.state.activeOnly;
        if (checked) {
            checked = false;
        } else {
            checked = true;
        }
        this.setState(
            {
                activeOnly: checked,
                structData: {},
                contractData: []
            },
            () => {
                this.getStructure(this.props.account.get("id"));
            }
        );
    }

    filterShownAcoounts() {
        let value = this.refs.account_filter.value.trim();
        value = value.toLowerCase();

        if (value !== "") {
            this.setState({
                findAccount: value
            });
            let elems = document.querySelectorAll("li.structure-item__row");
            for (var i = 0; i < elems.length; i++) {
                elems[i].classList.add("structure-item__row--hide");
            }
            let partnersName = this.state.partnersName;
            let resultArray = partnersName.filter(a => a.includes(value));

            if (resultArray.length > 0) {
                resultArray.map((item, i) =>
                    document
                        .getElementById(item)
                        .classList.remove("structure-item__row--hide")
                );
            }
        }
    }

    showAllAcoounts() {
        let elems = document.querySelectorAll("li.structure-item__row");
        for (var i = 0; i < elems.length; i++) {
            elems[i].classList.remove("structure-item__row--hide");
        }
        document.getElementById("accountFilter").value = "";
    }

    render() {
        let partners = [];
        let isFirstline = false;
        let firstlineLength = 0;
        if (this.state.structData["firstline"]) {
            partners = this.state.structData["firstline"];
            isFirstline = this.state.structData["firstline"];
            firstlineLength = isFirstline.length;
        }
        let statuses = ["Client", "Start", "Expert", "Citizen", "infinity"];
        let isProposal = this.state.isProposal;
        let apiUrl = this.props.apiUrl;

        return (
            <div>
                {/* HEADER */}
                <div className="structure-block">
                    <div className="structure-block__left">
                        <div className="structure__curent-wrap">
                            <span className="cwd-common__title">
                                <Translate content="account.structure.user_structure" />{" "}
                                <Link
                                    to={`/profile/${this.state.structData["name"]}`}
                                    className="structure__link"
                                >
                                    {this.state.structData["name"]}
                                </Link>
                            </span>
                        </div>
                    </div>
                </div>

                {/* ACC INFO */}
                <div className="structure-block structure-block--data">
                    <div className="structure-block__user-data">
                        <div className="structure-block__data-container">
                            <div className="structure-block__inner">
                                <span className="structure-block__data-item">
                                    <Translate
                                        content="account.structure.referral"
                                        component="span"
                                    />
                                </span>
                                <Link
                                    to={`/account/${this.state.userRef}/structure`}
                                    className="structure-block__data structure-block__data-item--value structure-block__data-item--link"
                                >
                                    {this.state.userRef}
                                </Link>
                            </div>
                            <div className="structure-block__inner">
                                <span className="structure-block__data-item">
                                    <Translate
                                        content="account.structure.contract"
                                        component="span"
                                    />
                                </span>
                                <span className="structure-block__data structure-block__data-item--value">
                                    <span className="structure-block__data structure-block__data-item--value">
                                        {
                                            statuses[
                                                this.state.structData["status"]
                                            ]
                                        }
                                    </span>
                                </span>
                            </div>
                            <div className="structure-block__inner">
                                <span className="structure-block__data-item">
                                    <Translate
                                        content="account.structure.leaders_level"
                                        component="span"
                                    />
                                </span>
                                <span className="structure-block__data structure-block__data-item--value structure-block__data-item--value-white">
                                    {this.state.structData["leaders_level"]}{" "}
                                    <Translate
                                        content="account.structure.leaders_level_of"
                                        component="span"
                                    />
                                    {" 8"}
                                </span>
                            </div>
                            <div className="structure-block__inner structure-block__inner--current">
                                <span className="structure-block__data-item">
                                    <Translate
                                        content="account.structure.total-team"
                                        component="span"
                                    />
                                </span>
                                <span className="structure-block__data structure-block__data-item--value">
                                    {this.state.structData["total_down"]}
                                </span>
                            </div>
                            <div className="structure-block__inner  structure-block__inner--current">
                                <span className="structure-block__data-item">
                                    <Translate
                                        content="account.structure.total-levels"
                                        component="span"
                                    />
                                </span>
                                <span className="structure-block__data structure-block__data-item--value">
                                    {this.state.structData["depth"]}
                                </span>
                            </div>
                        </div>

                        <div className="structure-block__data-container">
                            {/* PARTNERS */}
                            <div className="structure-block__inner  structure-block__inner--current">
                                <span className="structure-block__data-item">
                                    <Translate
                                        content="account.structure.starts"
                                        component="span"
                                    />
                                </span>
                                <span className="structure-block__data structure-block__data-item--value">
                                    {this.state.structData["partner_start"]}
                                </span>
                            </div>
                            <div className="structure-block__inner  structure-block__inner--current">
                                <span className="structure-block__data-item">
                                    <Translate
                                        content="account.structure.experts"
                                        component="span"
                                    />
                                </span>
                                <span className="structure-block__data structure-block__data-item--value">
                                    {this.state.structData["partner_expert"]}
                                </span>
                            </div>
                            <div className="structure-block__inner  structure-block__inner--current">
                                <span className="structure-block__data-item">
                                    <Translate
                                        content="account.structure.citizens"
                                        component="span"
                                    />
                                </span>
                                <span className="structure-block__data structure-block__data-item--value">
                                    {this.state.structData["partner_citizen"]}
                                </span>
                            </div>
                            <div className="structure-block__inner  structure-block__inner--current">
                                <span className="structure-block__data-item">
                                    <Translate
                                        content="account.structure.infinities"
                                        component="span"
                                    />
                                </span>
                                <span className="structure-block__data structure-block__data-item--value">
                                    {this.state.structData["partner_infinity"]}
                                </span>
                            </div>

                            {/* LEADERS */}
                            <div className="structure-block__inner  structure-block__inner--current">
                                <span className="structure-block__data-item">
                                    <Translate
                                        content="account.structure.leaders"
                                        component="span"
                                    />
                                </span>
                                <span className="structure-block__data structure-block__data-item--value">
                                    {this.state.structData["total_leaders"]}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* PROPOSAL BLOCK */}
                    {isProposal ? (
                        <div className="structure-proposal__wrap">
                            <Link
                                to={`/${this.state.structData["name"]}/poc_staking`}
                                className="structure__link structure-proposal__btn"
                            >
                                <Translate content="account.structure.propose_staking" />
                            </Link>

                            <Link
                                to={`/account/${this.state.structData["name"]}/vesting`}
                                className="structure__link structure-proposal__btn"
                            >
                                <Translate content="account.structure.propose_vesting" />
                            </Link>
                        </div>
                    ) : null}

                    {/* POGRESS BAR */}
                    <div
                        className="structure-block__progress"
                        id="progressBlock"
                    >
                        <div className="structure-block__indicators-wrap">
                            <Translate
                                className="structure-block__indicator-title"
                                content="account.structure.crowd-level"
                                component="span"
                            />
                            <Progress
                                percent={Math.round(
                                    this.state.structData[
                                        "next_level_percent"
                                    ] * 100
                                )}
                                theme={{active: {color: "#e6ba7d"}}}
                            />
                        </div>
                    </div>
                </div>

                <div className="structure__title-wrap">
                    <Translate
                        className="structure__title"
                        content="account.structure.first-line"
                        component="span"
                    />{" "}
                    <Link
                        to={`/profile/${this.state.structData["name"]}`}
                        className="structure__title structure__title--link structure__link"
                    >
                        {this.state.structData["name"]}
                    </Link>
                </div>

                <div className="user-team__search-wrap">
                    <input
                        className="user-team__acc-filter"
                        type="text"
                        name="accountFilter"
                        id="accountFilter"
                        placeholder={counterpart.translate(
                            "account.search_placeholder"
                        )}
                        ref="account_filter"
                        onChange={this.filterShownAcoounts.bind(this)}
                    />
                    <div
                        className="user-team__search-btn common-btn"
                        onClick={this.showAllAcoounts.bind(this)}
                    >
                        <Translate content="account.show_all" />
                    </div>
                    <label className="user-team__active-checkbox input-container">
                        <Translate
                            className={
                                this.state.activeOnly
                                    ? "input-container__text input-container__text--checked"
                                    : "input-container__text"
                            }
                            content="account.structure.hide-clients"
                            component="span"
                        />
                        <input
                            type="checkbox"
                            id="showUnactive"
                            name="showUnactive"
                            onClick={this.showUnactive.bind(this)}
                            defaultChecked={this.state.activeOnly}
                        />
                        <span className="input-container__checkbox" />
                    </label>
                </div>

                {this.state.structData["total_down"] &&
                this.state.structData["total_down"] > 0 ? (
                    <div>
                        {/* <label
                            className="structure__toggler"
                            htmlFor="showUnactive"
                        >
                            <input
                                className="structure__checkbox"
                                type="checkbox"
                                id="showUnactive"
                                name="showUnactive"
                                onClick={this.showUnactive.bind(this)}
                                defaultChecked={this.state.activeOnly}
                            />
                            <Translate
                                className="structure__text"
                                content="account.structure.hide-clients"
                                component="span"
                            />
                        </label> */}
                        {firstlineLength > 0 ? (
                            <ul className="structure__list">
                                <li className="structure-item structure-item__row structure-item__row--head">
                                    <div className="structure-item__inner structure-item__column">
                                        <span className="structure-item__column">
                                            <Translate
                                                content="account.structure.name"
                                                component="span"
                                            />
                                        </span>
                                    </div>
                                    <div className="structure-item__inner structure-item__column">
                                        <Translate
                                            content="account.structure.ref-link"
                                            component="span"
                                        />
                                    </div>
                                    <div className="structure-item__inner structure-item__column">
                                        <Translate
                                            content="account.structure.leader-value"
                                            component="span"
                                        />
                                    </div>
                                    <div className="structure-item__inner structure-item__column">
                                        <Translate
                                            content="account.structure.total-levels"
                                            component="span"
                                        />
                                    </div>
                                    <div className="structure-item__inner structure-item__column">
                                        <Translate
                                            content="account.structure.leaders"
                                            component="span"
                                        />
                                    </div>
                                    <div className="structure-item__inner structure-item__column">
                                        <Translate
                                            content="account.structure.total-team"
                                            component="span"
                                        />
                                    </div>
                                </li>

                                {partners.map(partner => (
                                    <AccountStructureItem
                                        key={partner.id}
                                        contractData={partner}
                                        apiUrl={apiUrl}
                                    />
                                ))}
                            </ul>
                        ) : (
                            <Translate
                                content="account.structure.no_active_partners"
                                className="structure__subheader"
                                component="h2"
                            />
                        )}
                    </div>
                ) : null}

                {this.state.structData &&
                this.state.structData["total_down"] == 0 ? (
                    <Translate
                        className="structure__subheader"
                        content="account.structure.empty-first-line"
                        component="h2"
                    />
                ) : null}

                {this.state.structData["id"] ? null : (
                    <LoadingIndicator
                        loadingText={counterpart.translate(
                            "app_init.structure_loading_text",
                            {
                                account: this.props.account.get("name")
                            }
                        )}
                    />
                )}
            </div>
        );
    }
}

export default AccountStructure = connect(AccountStructure, {
    listenTo() {
        return [AccountStore];
    },
    getProps() {
        if (AccountStore.getState().passwordAccount) {
            return {
                pass_account: ChainStore.fetchFullAccount(
                    AccountStore.getState().passwordAccount
                )
            };
        }
    }
});
