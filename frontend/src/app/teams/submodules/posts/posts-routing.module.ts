import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostsComponent } from './pages/posts/posts.component';
import { PostsFavouriteComponent } from './pages/posts-favourite/posts-favourite.component';
import { PostComponent } from './pages/post/post.component';

const routes: Routes = [
  {
    path: '',
    component: PostsComponent,
  },
  {
    path: ':id',
    component: PostComponent,
  },
  {
    path: 'favourites',
    component: PostsFavouriteComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostsRoutingModule {}
