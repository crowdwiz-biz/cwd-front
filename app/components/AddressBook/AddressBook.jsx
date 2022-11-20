import React from "react";
import { ChainStore } from "bitsharesjs";
import { connect } from "alt-react";
import AccountStore from "stores/AccountStore";
import Translate from "react-translate-component";
import AddressInput from "./components/AddressInput";
import AddressList from "./components/AddressList";
import { Collapse } from "react-bootstrap";
import NewIcon from "../NewIcon/NewIcon";



//STYLES
import "./scss/_all-address-book.scss";

class AddressBook extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            intervalID: 0,
            lsAddresBook: localStorage.getItem("__cwd__addressBook"),
            isTextCollapsed: true
        }
    }

    UNSAFE_componentWillMount() {
        this.getLSData();

        this.setState({
            intervalID: setInterval(this.getLSData.bind(this), 500)
        });
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalID);
    }

    getLSData() {
        if (localStorage.getItem("__cwd__addressBook") != this.state.lsAddresBook) {
            this.setState({ lsAddresBook: localStorage.getItem("__cwd__addressBook") });
        }
    }

    collapseText() {
        let isTextCollapsed = this.state.isTextCollapsed;

        this.setState({
            isTextCollapsed: !isTextCollapsed
        });
    }

    render() {
        let currentAccount = this.props.currentAccount;
        let isTextCollapsed = this.state.isTextCollapsed;

        return (
            <section className="cwd-common__wrap">
                <div className="address-book__wrap">
                    <Translate
                        className="cwd-common__title"
                        content="address_book.menu_title"
                    />

                    <Collapse in={!isTextCollapsed}>
                        <Translate
                            className="address-book__intro-text"
                            content="address_book.intro_text"
                        />
                    </Collapse>

                    <button
                        onClick={this.collapseText.bind(this)}
                        className="cwd-btn__show-more-btn noselect"
                    >
                        {this.state.isTextCollapsed ? (
                            <Translate content="proof_of_crowd.show_more_btn" />
                        ) : (
                            <Translate content="proof_of_crowd.hide_details_btn" />
                        )}

                        <NewIcon
                            iconClass={this.state.isTextCollapsed ? "" : "hide-arrow"}
                            iconWidth={15}
                            iconHeight={8}
                            iconName={"show_more_arrow"}
                        />
                    </button>


                    <AddressInput
                        currentAccount={currentAccount}
                        history={this.props.history}
                    />

                    <AddressList
                        currentAccount={currentAccount}
                        history={this.props.history}
                    />
                </div>
            </section>
        );
    }
}

export default AddressBook = connect(AddressBook, {
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