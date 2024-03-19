package org.kaiteki.backend.integrations.spotify.services;

import jakarta.servlet.http.HttpServletResponse;
import org.kaiteki.backend.auth.service.CurrentSessionService;
import org.kaiteki.backend.integrations.spotify.models.SpotifyCredentials;
import org.kaiteki.backend.integrations.spotify.models.dto.SpotifyLoginDTO;
import org.kaiteki.backend.integrations.spotify.repositories.SpotifyCredentialsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import se.michaelthelin.spotify.SpotifyApi;
import se.michaelthelin.spotify.SpotifyHttpManager;
import se.michaelthelin.spotify.model_objects.credentials.AuthorizationCodeCredentials;
import se.michaelthelin.spotify.model_objects.specification.*;
import se.michaelthelin.spotify.requests.authorization.authorization_code.AuthorizationCodeRefreshRequest;
import se.michaelthelin.spotify.requests.authorization.authorization_code.AuthorizationCodeRequest;
import se.michaelthelin.spotify.requests.authorization.authorization_code.AuthorizationCodeUriRequest;
import se.michaelthelin.spotify.requests.data.browse.GetCategorysPlaylistsRequest;
import se.michaelthelin.spotify.requests.data.library.GetCurrentUsersSavedAlbumsRequest;
import se.michaelthelin.spotify.requests.data.personalization.simplified.GetUsersTopTracksRequest;
import se.michaelthelin.spotify.requests.data.playlists.GetListOfCurrentUsersPlaylistsRequest;
import se.michaelthelin.spotify.requests.data.playlists.GetPlaylistRequest;

import java.net.URI;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SpotifyService {
    private final SpotifyApi spotifyApi;
    private final SpotifyCredentialsService spotifyCredentialsService;

    @Autowired
    public SpotifyService(@Value("${integrations.spotify.redirect-url}") String redirectUrl,
                          @Value("${integrations.spotify.client.id}") String clientId,
                          @Value("${integrations.spotify.client.secret}") String clientSecret,
                          SpotifyCredentialsService spotifyCredentialsService) {
        this.spotifyCredentialsService = spotifyCredentialsService;
        this.spotifyApi = new SpotifyApi.Builder()
                .setClientId(clientId)
                .setClientSecret(clientSecret)
                .setRedirectUri(SpotifyHttpManager.makeUri(redirectUrl))
                .build();
    }

    public SpotifyLoginDTO getLoginUrl() {
        String defaultPermissionScope = "user-read-email " +
                "playlist-read-collaborative " +
                "playlist-read-private " +
                "streaming " +
                "user-follow-read " +
                "user-modify-playback-state " +
                "user-read-playback-state " +
                "user-read-currently-playing " +
                "user-library-read " +
                "user-read-recently-played " +
                "user-top-read " +
                "user-read-private ";

        AuthorizationCodeUriRequest authCodeUriReq = spotifyApi.authorizationCodeUri()
                .scope(defaultPermissionScope)
                .show_dialog(true)
                .build();

        try {
            URI uri = authCodeUriReq.execute();

            return SpotifyLoginDTO.builder()
                    .loginUrl(uri.toString())
                    .build();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to get login url");
        }
    }

    public void getSpotifyUserCode(String userCode) {
        AuthorizationCodeRequest authCodeReq = spotifyApi.authorizationCode(userCode).build();

        try {
            AuthorizationCodeCredentials credentials = authCodeReq.execute();

            spotifyApi.setAccessToken(credentials.getAccessToken());
            spotifyApi.setRefreshToken(credentials.getRefreshToken());

            spotifyCredentialsService.saveUserCredentials(credentials);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    public List<PlaylistSimplified> getUsersPlaylists() {
        SpotifyApi authSpotifyApi = spotifyCredentialsService.getAuthSpotifyApi(spotifyApi);

        GetListOfCurrentUsersPlaylistsRequest getListOfCurrentUsersPlaylistsRequest = authSpotifyApi.getListOfCurrentUsersPlaylists()
                .limit(10)
                .offset(0)
                .build();

        try {
            Paging<PlaylistSimplified> playlistSimplifiedPaging = getListOfCurrentUsersPlaylistsRequest.execute();
            return List.of(playlistSimplifiedPaging.getItems());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to get users playlists: " + e.getMessage());
        }
    }

    public Playlist getPlaylistById(String playlistId) {
        SpotifyApi authSpotifyApi = spotifyCredentialsService.getAuthSpotifyApi(spotifyApi);

        GetPlaylistRequest getPlaylistRequest = authSpotifyApi.getPlaylist(playlistId).build();

        try {
            return getPlaylistRequest.execute();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to get users playlists: " + e.getMessage());
        }
    }

    public List<PlaylistSimplified> getPlaylistsByCategory(String categoryId) {
        SpotifyApi authSpotifyApi = spotifyCredentialsService.getAuthSpotifyApi(spotifyApi);

        GetCategorysPlaylistsRequest getCategorysPlaylistsRequest = authSpotifyApi.getCategorysPlaylists(categoryId)
                .limit(10)
                .offset(0)
                .build();

        try {
            Paging<PlaylistSimplified> playlistSimplifiedPaging = getCategorysPlaylistsRequest.execute();
            return List.of(playlistSimplifiedPaging.getItems());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to get playlists by category: " + e.getMessage());
        }
    }
}
