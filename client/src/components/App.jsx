import React from 'react';
import PropTypes from 'prop-types';
import FeaturedReview from './FeaturedReview.jsx';
import ReviewList from './ReviewList.jsx';
import CourseSummary from './StudentFeedback.jsx';
import Search from './Search.jsx';
import styles from '../styles/App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      courseStats: {},
      featuredReview: {},
      reviews: [],
      queryTerm: '',
      reviewsFilteredBySearch: [],
      reviewsFilteredByRating: [],
      currentFilterRating: null,
      numOfReviewsToShow: 10,
    };

    this.filterAndBoldOnSearch = this.filterAndBoldOnSearch.bind(this);
    this.filterOnRatingClick = this.filterOnRatingClick.bind(this);
    this.addTenReviews = this.addTenReviews.bind(this);
  }

  componentDidMount() {
    this.getReviews(this.props.courseId);
  }

  getReviews(courseId) {
    fetch(`${courseId}/reviews`)
      .then(rawData => (rawData.text()))
      .then((data) => {
        this.setState(JSON.parse(data));
        this.setState({
          reviewsFilteredBySearch: this.state.reviews,
          reviewsFilteredByRating: this.state.reviews,
        });
      })
      .catch((err) => {
        throw Error(err);
      });
  }

  addTenReviews() {
    this.setState({ numOfReviewsToShow: this.state.numOfReviewsToShow + 10 });
  }

  filterAndBoldOnSearch(query) {
    this.setState({ queryTerm: query });
    const filteredReviews = this.state.reviews.filter(reviewObj => (
      reviewObj.review.toUpperCase().includes(query.toUpperCase())
    ));

    const filteredAndBoldedReviews = filteredReviews.map((reviewObj) => {
      const queryStartingIndex = reviewObj.review.toUpperCase().indexOf(query.toUpperCase());
      const queryEndingIndex = queryStartingIndex + query.length;
      const boldedReview = {
        preQuery: reviewObj.review.slice(0, queryStartingIndex),
        query: <b>{reviewObj.review.slice(queryStartingIndex, queryEndingIndex)}</b>,
        postQuery: reviewObj.review.slice(queryEndingIndex),
      };

      return {
        user: reviewObj.user,
        rating: reviewObj.rating,
        date: reviewObj.date,
        upvotes: reviewObj.upvotes,
        downvotes: reviewObj.downvotes,
        review: boldedReview,
      };
    });
    // put this somewhere else
    this.setState({ reviewsFilteredBySearch: filteredAndBoldedReviews });
  }

  filterOnRatingClick(rating) {
    if (rating === this.state.currentFilterRating) {
      this.setState({
        reviewsFilteredByRating: this.state.reviews,
        currentFilterRating: null,
      });
    } else {
      const filteredReviews = this.state.reviews.filter(review => (review.rating === rating));
      this.setState({
        reviewsFilteredByRating: filteredReviews,
        currentFilterRating: rating,
      });
    }
  }

  // this was the most naive way...definitely can optimize
  reviewsFilteredBySearchAndRating() {
    const reviewsFilteredBySearchAndRating = [];
    this.state.reviewsFilteredBySearch.forEach((searchReview) => {
      this.state.reviewsFilteredByRating.forEach((ratingReview) => {
        if (searchReview.user.userId === ratingReview.user.userId) {
          reviewsFilteredBySearchAndRating.push(searchReview);
          return;
        }
      });
    });

    return reviewsFilteredBySearchAndRating;
  }

  setReviewHeader() {
    if (this.state.queryTerm !== '') {
      return (
        <span className={styles.reviewsHeader}>
          Reviews mentioning <i>"{this.state.queryTerm}"</i>
        </span>
      );
    }
    return <span className={styles.reviewsHeader}>Reviews</span>;
  }

  render() {
    if (this.state.reviews.length > 0) {
      return (
        <div className={styles.reviewModule}>
          <FeaturedReview featuredReview={ this.state.featuredReview } />
          <CourseSummary stats={ this.state.courseStats } ratingFilter={ this.filterOnRatingClick }
            selectedStar={ this.state.currentFilterRating } />
          <div className={styles.reviewsContainerHeaderAndSearch}>
              {this.setReviewHeader()}
              <Search searchFilter={this.filterAndBoldOnSearch}
                currentlyFiltered={this.state.reviewsFilteredBySearch.length !== this.state.reviews.length}
              />
          </div>
          <ReviewList filteredReviews={ this.reviewsFilteredBySearchAndRating() }
          numOfReviewsToShow={ this.state.numOfReviewsToShow } addTen={ this.addTenReviews }
          />
        </div>
      );
    }
    return (
      <div>
        <img src='https://thumbs.gfycat.com/FaithfulDeafeningBullmastiff-small.gif'></img>
      </div>
    );
  }
}

App.propTypes = {
  courseId: PropTypes.number,
  courseName: PropTypes.string,
};

export default App;