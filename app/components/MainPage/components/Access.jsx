import React from "react";
import Translate from "react-translate-component";
import safe from "assets/svg-images/svg-common/main-page/principles/safe.svg";

class Development extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <section className="mp-access">
                <div className="grid">
                    <div className="left-panel">
                        <div className="content wow animate__animated animate__fadeIn" data-wow-duration="2s"  data-wow-delay="0.2s">
                            <Translate
                                className="title"
                                content="main_page.access.left.title"
                                component="h2"
                            />
                            <Translate
                                className="description"
                                content="main_page.access.left.description"
                                component="div"
                            />
                        </div>
                        <div className="image-wrapper">
                            <img src={safe} alt="bitshares" />
                        </div>
                        <Translate
                            className="button"
                            content="main_page.access.left.button"
                            component="button"
                        />
                    </div>
                    <div className="right-panel">
                        <div className="item wow animate__animated animate__fadeIn"  data-wow-delay="0.4s"  data-wow-duration="2s">
                            <Translate
                                className="description"
                                content="main_page.access.right.block1.description"

                                component="div"
                            />
                            <Translate
                                className="subtitle"
                                content="main_page.access.right.block1.title"
                                component="h3"
                            />
                        </div>
                        <div className="item wow animate__animated animate__fadeIn"  data-wow-delay="0.6s" data-wow-duration="2s">
                            <Translate
                                className="description"
                                content="main_page.access.right.block2.subtitle"
                                component="div"
                            />
                            <Translate
                                className="subtitle"
                                content="main_page.access.right.block2.title"
                                component="h3"
                            />
                            <Translate
                                className="description"
                                content="main_page.access.right.block2.description"
                                component="div"
                            />
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

export default Development;
