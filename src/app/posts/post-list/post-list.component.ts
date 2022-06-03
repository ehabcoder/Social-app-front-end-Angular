import { AuthService } from './../../auth/auth.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';

import { PostService } from './../post.service';
import { Posts } from "../../Interfaces/posts";


@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {

  // posts = [
  //   {
  //     title: 'first post', content: 'This is the first post'
  //   },
  //   {
  //     title: 'second post', content: 'This is the second post'
  //   },
  //   {
  //     title: 'third post', content: 'This is the third post'
  //   },
  // ]
  posts: Posts[] = [];
  creator: string;
  private postsSub: Subscription;
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  private authStatusSub: Subscription;
  userIsAuthenticated = false;
  userId: string;

  constructor(private postService: PostService, private authService: AuthService) { }


  ngOnInit(): void {
    this.isLoading = true;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.postsSub = this.postService.getPostUpdateListener().subscribe(
      (postData: {posts: Posts[], postCountnumber: number}) => {
        this.isLoading = false;
        this.totalPosts = postData.postCountnumber;
        this.posts = postData.posts;
      }
    );
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
      this.userId = this.authService.getUserId();
    });

  }



  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
  }

  onDelete(id) {
    this.isLoading = true;
    this.postService.deletePost(id).subscribe((res) => {
      this.postService.getPosts(this.postsPerPage, this.currentPage)
    }, () => {
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }

}
