import React from "react";
import Translate from "react-translate-component";
import principle1 from "assets/svg-images/svg-common/main-page/principles/principle1.svg";
import principle2 from "assets/svg-images/svg-common/main-page/principles/principle2.svg";
import principle3 from "assets/svg-images/svg-common/main-page/principles/principle3.svg";
import arrow from "assets/svg-images/svg-common/main-page/principles/arrow.svg";

class CommunityPrinciples extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentSlide: 1,
            menu: [
                {
                    id: 1,
                    title: "main_page.community_principles.blocks.block1.title",
                    description: "main_page.community_principles.blocks.block1.description",
                    link: "https://github.com/crowdwiz-biz/docs?tab=readme-ov-file#платформа-crowdwiz",
                    linkName: "main_page.community_principles.blocks.block1.link",
                    img: principle1,
                },
                {
                    id: 2,
                    title: "main_page.community_principles.blocks.block2.title",
                    description: "main_page.community_principles.blocks.block2.description",
                    link: "https://github.com/crowdwiz-biz/docs?tab=readme-ov-file#платформа-crowdwiz",
                    linkName: "main_page.community_principles.blocks.block2.link",
                    img: principle2,
                },
                {
                    id: 3,
                    title: "main_page.community_principles.blocks.block3.title",
                    description: "main_page.community_principles.blocks.block3.description",
                    link: "https://github.com/crowdwiz-biz/docs?tab=readme-ov-file#платформа-crowdwiz",
                    linkName: "main_page.community_principles.blocks.block3.link",
                    img: principle3,
                }
            ]
        };
    }

    nextSlide = () => {
        this.setState((prevState) => ({
            currentSlide: (prevState.currentSlide + 1) % 3,
        }));
    };

    prevSlide = () => {
        this.setState((prevState) => ({
            currentSlide: (prevState.currentSlide - 1 + 3) % 3,
        }));
    };

    render() {
        const { menu, currentSlide } = this.state;
        return (
            <section className="mp-community-principles" data-aos="zoom-in">
                <Translate
                    className="subtitle"
                    content="main_page.community_principles.subtitle"
                    component="h3"
                />
                <h2 className="main-title">CWD GLOBAL</h2>
                <div className="principles wow fadeInUp" data-wow-duration="1s">
                    {(menu || []).map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`principles__item ${(window.innerWidth > 990 || index === currentSlide) && "visible"}`}
                        >
                            <div className="icon-wrapper">
                                <img src={slide.img} />
                            </div>
                            <Translate
                                className="title"
                                content={slide.title}
                                component="div"
                            />
                            <Translate
                                className="description"
                                content={slide.description}
                                component="div"
                            />

                            <Translate
                                className="link"
                                content={slide.linkName}
                                component="a"
                                target="_blank"
                                href={slide.link}
                            />
                        </div>
                    ))}
                </div>
                {window.innerWidth <= 990 && (
                    <div className="navigation">
                        <div className="arrow arrow__left" onClick={this.prevSlide}>
                            <img src={arrow} alt="arrow" />
                        </div>
                        <div className="arrow arrow__right" onClick={this.nextSlide}>
                            <img src={arrow} alt="arrow" />
                        </div>
                    </div>
                )}
            </section>
        );
    }
}

export default CommunityPrinciples;
