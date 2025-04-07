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
                    <div className="image-wrapper wow animate__animated animate__fadeIn" data-wow-duration="2s"  data-wow-delay="0.2s">
                        <img src={bitshares} alt="bitshares" />
                    </div>
                    <Translate
                        className="subtitle wow animate__animated animate__fadeIn"
                        content="main_page.development.subtitle"
                        data-wow-duration="2s"  data-wow-delay="0.4s"
                        component="h3"
                    />
                    <h2 className="title wow animate__animated animate__fadeIn" data-wow-duration="2s"  data-wow-delay="0.6s">
                        BitShares
                    </h2>
                </div>
            </section>
        );
    }
}

export default Development;
