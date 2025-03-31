import React from "react";
import Translate from "react-translate-component";
import bitshares from "assets/svg-images/svg-common/main-page/principles/bitshares.svg";

class Development extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <section className="mp-development">
                <div className="content">
                    <div className="image-wrapper">
                        <img src={bitshares} alt="bitshares" />
                    </div>
                    <Translate
                        className="subtitle"
                        content="main_page.development.subtitle"
                        component="h3"
                    />
                    <h2 className="title">
                        BitShares
                    </h2>
                </div>
            </section>
        );
    }
}

export default Development;
