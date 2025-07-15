import SearchIcon from '../../../assets/search.svg';

export default function Searchcontainer(){
    return (
              <div className="search-container" id="Teamselectionsearchbar">
                <input type="text" placeholder="Search" className="search-input" />
                <img src={SearchIcon} alt="Search" className="search-icon" />
              </div>
    );
           
}