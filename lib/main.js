import 'fetch';
import React from 'react';

let el = React.createElement
  , $ = React.findDOMNode;

class Component extends React.Component {
  static create(...args) {
    return el(this, ...args)
  }
}

class CommentBox extends Component {
  constructor(props) {
    super(props);
    this.state = { data: [] };
  }

  componentDidMount() {
    this.loadCommentsFromServer();
  }

  loadCommentsFromServer() {
    return fetch(this.props.url)
      .then(response => response.json())
      .then(data => this.setState({ data }))
      .catch(err => {
        console.error(this.props.url, err.toString())
      });
  }

  handleCommentSubmit(comment) {
    var comments = this.state.data;
    this.setState({ data: comments.concat([comment]) });

    var request = {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(comment)
    };

    return fetch(this.props.url, request)
      .then(response => response.json())
      .then(data => this.setState({ data }))
      .catch(err => {
        this.setState({ data: comments })
      });
  }

  render() {
    return el('div', { className: 'commentBox' },
      el('h1', null, 'Comments 2'),
      CommentList.create({ data: this.state.data }),
      CommentForm.create({ onCommentSubmit: this.handleCommentSubmit })
    );
  }
}

class CommentList extends Component {
  render() {
    var commentNodes = this.props.data.map(comment => {
      return el(Comment, { author: comment.author }, comment.text);
    });

    return el('div', { className: 'commentList' }, commentNodes);
  }
}

class CommentForm extends Component {
  handleSubmit(e) {
    e.preventDefault();

    var author = $(this.refs.author).value.trim();
    var text = $(this.refs.text).value.trim();

    if (!text || !author) return;

    this.props.onCommentSubmit({ author: author, text: text });

    $(this.refs.author).value = '';
    $(this.refs.text).value = '';
  }

  render() {
    return el('form',
      { className: 'commentForm', onSubmit: this.handleSubmit },
      el('input', {
        type: 'text', placeholder: 'Your name', ref: 'author'
      }),
      el('input', {
        type: 'text', placeholder: 'Say something...', ref: 'text'
      }),
      el('input', {
        type: 'submit', value: 'Post'
      })
    )
  }
}

class Comment extends Component {
  render() {
    return el('div', { className: 'comment' },
      el('h2', { className: 'commentAuthor' }, this.props.author),
      this.props.children
    );
  }
}

React.render(
  CommentBox.create({ url: 'comments.json' }),
  document.getElementById('app')
);