import "./index.css";

const Loader = () => {
    return (
        <>
            <div className="load_fader"></div>
            <div className="loader">
                <div className="loader__block">
                    Loading...
                    <br />
                    <div className="loader__spinner"></div>
                </div>
            </div>
        </>
    );
};

export default Loader;
