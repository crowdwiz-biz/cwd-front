import React from "react";
import {connect} from "alt-react";
import Translate from "react-translate-component";
import NewIcon from "../../NewIcon/NewIcon";
import WalletUnlockStore from "stores/WalletUnlockStore";

class LeftMenuItem extends React.Component {
    constructor(props) {
        super(props);
    }

    _onNavigate(route, menuItemID, e) {
        e.preventDefault();

        var elems = document.getElementsByClassName("leftmenu__li");
        for (var i = 0; i < elems.length; i++) {
            elems[i].classList.remove("leftmenu__li--active");
        }
        var menuItemID = document
            .getElementById(menuItemID)
            .classList.add("leftmenu__li--active");

        this.props.history.push(route);
        this.props.toggleOff();
    }

    render() {
        let item = this.props.item;
        let isToggled = this.props.isToggled;

        return (
            <li
                className={
                    this.props.isMobile
                        ? "leftmenu__li--mobile"
                        : "leftmenu__li"
                }
                id={item.itemID}
                onClick={this._onNavigate.bind(
                    this,
                    item.route.replace(
                        "/account_name",
                        "/" + this.props.currentAccount
                    ),
                    item.itemID
                )}
            >
                <NewIcon
                    iconClass={"leftmenu__mobile-icon"}
                    iconWidth={24}
                    iconHeight={24}
                    iconName={item.iconName}
                />

                {isToggled ? (
                    <div>
                        <Translate
                            className="leftmenu__text"
                            content={item.menuText}
                        />
                    </div>
                ) : null}
            </li>
        );
    }
}
LeftMenuItem = connect(LeftMenuItem, {
    listenTo() {
        return [WalletUnlockStore];
    },
    getProps() {
        return {
            locked: WalletUnlockStore.getState().locked
        };
    }
});

export default LeftMenuItem;
