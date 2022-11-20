import React from "react";
import {Link} from "react-router-dom";
import {connect} from "alt-react";
import SettingsStore from "stores/SettingsStore";
import Translate from "react-translate-component";

let logo404 = require("assets/png-images/others/logo-404.png");

class Page404 extends React.Component {
    render() {
        return (
            <div className="page-404">
                <div className="page-404__container">
                    <div className="page-404__logo">
                        <img src={logo404} alt="Logo" />
                    </div>

                    <div className="page-404__subtitle">
                        <Translate content="page404.page_not_found_subtitle" />
                    </div>
                    <div className="page-404-button-back">
                        <Link to={"/"}>
                            <Translate
                                component="span"
                                className="page-404__link"
                                content="page404.home"
                            />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}

export default Page404 = connect(Page404, {
    listenTo() {
        return [SettingsStore];
    },
    getProps() {
        return {
            theme: SettingsStore.getState().settings.get("themes")
        };
    }
});
