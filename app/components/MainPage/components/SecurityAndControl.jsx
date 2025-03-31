import React from "react";
import Translate from "react-translate-component";
import secure from "assets/svg-images/svg-common/main-page/principles/secure.svg";

class SecurityAndControl extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <section className="mp-security">
                <div className="content">
                    <div className="image-wrapper">
                        <img src={secure} alt="secure" />
                    </div>
                    <Translate
                        className="subtitle"
                        content="main_page.security.subtitle"
                        component="h3"
                    />
                    <h2 className="title">
                        <Translate
                            content="main_page.security.main"
                            component="div"
                        />
                        <Translate
                            content="main_page.security.title"
                            component="div"
                        />
                    </h2>
                </div>
            </section>
        );
    }
}

export default SecurityAndControl;
