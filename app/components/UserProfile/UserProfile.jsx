import React from "react";
import { ChainStore } from "bitsharesjs";
import { connect } from "alt-react";
import AccountStore from "stores/AccountStore";
import Translate from "react-translate-component";
import NewIcon from "../NewIcon/NewIcon";
import SendMessage from "../SendMessage/SendMessage";
import { Apis } from "bitsharesjs-ws";
import MainUserData from "./components/MainUserData";
import UserContract from "./components/UserContract";
import RefLinkBlock from "./components/RefLinkBlock";
import AchievementsBlock from "./components/AchievementsBlock";
import Page404 from "../Page404/Page404";
import ls from "common/localStorage";


let ss = new ls("__graphene__");

//STYLES
import "./scss/_all-profile.scss";

class UserProfile extends React.Component {
    constructor(props) {
        super(props);

        let host = window.location.hostname;
        if (["127.0.0", "192.168"].includes(host.substring(0, 7))) {
            host = "backup.cwd.global"
        }

        this.state = {
            currentAccount: {},
            isMessageModalVisible: false,
            leadersLevel: 0,
            toAccountId: "",
            accountId: "1",
            accountName: "",
            referrer: "",
            lastGRvolume: 0,
            usercontract: 0,
            contractExpirationDate: "",
            userRank: 5,
            isApostol: false,
            userDex: 0,
            userScoop: 0,
            gotApiResult: false,
            grTeamId: "",
            grTeamName: "",
            teamLogo: "https://" + host + "/static/cwd_preview.jpg",
            isContactAdded: false
        }
    }

    getProfile(toAccount) {
        Apis.instance()
            .db_api()
            .exec("get_full_accounts", [[toAccount], false])
            .then(data => {
                this.setState({
                    currentAccount: data,
                    toAccountId: data[0][1]["account"]["id"],
                    accountId: data[0][1]["account"]["id"],
                    accountName: data[0][1]["account"]["name"],
                    isApostol: data[0][1]["account"]["apostolos"],
                    userRank: data[0][1]["account"]["last_gr_rank"],
                    contractExpirationDate: data[0][1]["account"]["referral_status_expiration_date"],
                    referalStatus: data[0][1]["account"]["referral_status_type"],
                    lastGRvolume: data[0][1]["statistics"]["current_period_gr"],
                    userDex: data[0][1]["statistics"]["p2p_current_month_rating"],
                    userScoop: data[0][1]["statistics"]["lottery_goods_rating"],
                    referrer: data[0][1]["referrer_name"],
                    gotApiResult: true
                })

                if (data[0][1]["account"]["gr_team"]) {
                    Apis.instance()
                        .db_api()
                        .exec("get_objects", [[data[0][1]["account"]["gr_team"]]])
                        .then(teamData => {
                            this.setState({
                                grTeamId: teamData[0]["id"],
                                grTeamName: teamData[0]["name"],
                                teamLogo: teamData[0]["logo"]
                            })
                        })
                }
                else {
                    let host = window.location.hostname;
                    if (["127.0.0", "192.168"].includes(host.substring(0, 7))) {
                        host = "backup.cwd.global"
                    }

                    this.setState({
                        grTeamId: "",
                        grTeamName: "",
                        teamLogo: "https://" + host + "/static/cwd_preview.jpg"
                    })
                }

                this.getStructure(data[0][1]["account"]["id"]);
            },
                error => {
                    this.setState({
                        gotApiResult: true
                    });
                }
            )
    }

    getStructure(acc_id) {
        let apiUrl = ss.get("serviceApi");
        let structureUrl = apiUrl + "/structure/" + acc_id + "-p.json";

        fetch(structureUrl)
            .then(response => response.json())
            .then(data => {
                this.setState({
                    leadersLevel: data["leaders_level"]
                });
            })
    }

    componentDidMount() {
        let toAccount = this.props.match.params.account_name;

        this.getProfile(toAccount);

    }

    UNSAFE_componentWillReceiveProps(np) {
        let toAccount = np.match.params.account_name;
        this.getProfile(toAccount);
    }


    showMessageModal() {
        this.setState({
            isMessageModalVisible: true
        })
    }

    closeMessageModal() {
        this.setState({
            isMessageModalVisible: false
        })
    }

    addToContacts() {
        let inspectedAccount = this.state.accountId;
        let accountDescription = "";
        let lsAddressBook = JSON.parse(localStorage.getItem("__cwd__addressBook"));

        if (lsAddressBook === null) {
            lsAddressBook = {};
        }
        lsAddressBook[inspectedAccount] = accountDescription;
        localStorage.setItem("__cwd__addressBook", JSON.stringify(lsAddressBook));

        this.setState({
            isContactAdded: true
        })
    }

    removeFromContacts(accountId) {
        let lsAddressBook = JSON.parse(localStorage.getItem("__cwd__addressBook"));
        if (accountId in lsAddressBook) {
            delete lsAddressBook[accountId];
            localStorage.setItem("__cwd__addressBook", JSON.stringify(lsAddressBook));
        }


        this.setState({
            isContactAdded: false
        })
    }

    render() {
        let {
            isMessageModalVisible,
            toAccountId,
            accountId,
            leadersLevel,
            accountName,
            referrer,
            lastGRvolume,
            referalStatus,
            contractExpirationDate,
            currentAccount,
            userRank,
            isApostol,
            userDex,
            userScoop,
            gotApiResult,
            grTeamId,
            grTeamName,
            teamLogo,
            isContactAdded
        } = this.state;

        if (Object.keys(currentAccount).length > 0) {
            let toAccount;
            let notMyAccount;
            if (this.props.account) {
                let currentAccountName = this.props.account.get("name");
                toAccount = this.props.match.params.account_name;
                notMyAccount = toAccount != currentAccountName;
            }
            else {
                toAccount = this.props.match.params.account_name;
                notMyAccount = true;
            }
            let currentAddressBook = JSON.parse(localStorage.getItem("__cwd__addressBook"));
            if (currentAddressBook === null) {
                currentAddressBook = {};
            }
            if (accountId in currentAddressBook) {
                isContactAdded = true
            }
            else {
                isContactAdded = false
            }

            return (
                <section className="profile__wrap">
                    <div className="cwd-common__wrap-920">
                        <div className="profile__header">
                            <Translate
                                className="cwd-common__title-upper-case"
                                content="user_profile.title"
                            />

                            {notMyAccount ?
                                <div className="profile__action-btn-wrap">
                                    {isContactAdded ?
                                        <button
                                            className="cwd-btn__action-btn profile__btn--remove-contact"
                                            type="button"
                                            onClick={this.removeFromContacts.bind(this, accountId)}
                                        >
                                            <Translate content="address_book.remove_from_contacts_btn" />

                                            <NewIcon
                                                iconWidth={11}
                                                iconHeight={11}
                                                iconName={"icon_plus"}
                                            />
                                        </button>
                                        :
                                        <button
                                            className="cwd-btn__action-btn"
                                            type="button"
                                            onClick={this.addToContacts.bind(this)}
                                        >
                                            <Translate content="address_book.add_to_contacts_btn" />

                                            <NewIcon
                                                iconWidth={11}
                                                iconHeight={11}
                                                iconName={"icon_plus"}
                                            />
                                        </button>
                                    }

                                    <button
                                        className="cwd-btn__action-btn"
                                        type="button"
                                        onClick={this.showMessageModal.bind(this)}
                                    >
                                        <Translate content="send_message.message_btn" />

                                        <NewIcon
                                            iconWidth={10}
                                            iconHeight={12}
                                            iconName={"send_message"}
                                        />
                                    </button>
                                </div>
                                : null}
                        </div>

                        <MainUserData
                            accountId={accountId}
                            accountName={accountName}
                            referrer={referrer}
                            lastGRvolume={lastGRvolume}
                            notMyAccount={notMyAccount}
                            leadersLevel={leadersLevel}
                        />

                        <UserContract
                            accountId={accountId}
                            accountName={accountName}
                            contractExpirationDate={contractExpirationDate}
                            referalStatus={referalStatus}
                            notMyAccount={notMyAccount}
                        />

                        <RefLinkBlock
                            accountName={accountName}
                        />

                        {isMessageModalVisible ?
                            <SendMessage
                                toAccountId={toAccountId}
                                toAccountName={accountName}
                                closeModal={this.closeMessageModal.bind(this)}
                            />
                            : null}
                    </div>

                    <div className="profile__full-width-wrap">
                        <div className="cwd-common__wrap-920">
                            <AchievementsBlock
                                grTeamId={grTeamId}
                                grTeamName={grTeamName}
                                teamLogo={teamLogo}
                                userRank={userRank}
                                isApostol={isApostol}
                                userDex={userDex}
                                userScoop={userScoop}
                            />
                        </div>
                    </div>
                </section>)
        }
        else if (!gotApiResult) {
            return null;
        }
        else {
            return <Page404 />;
        }
    }
}

export default UserProfile = connect(UserProfile, {
    listenTo() {
        return [AccountStore];
    },
    getProps() {
        if (AccountStore.getState().passwordAccount) {
            return {
                account: ChainStore.fetchFullAccount(
                    AccountStore.getState().currentAccount ||
                    AccountStore.getState().passwordAccount
                )
            };
        }
    }
});