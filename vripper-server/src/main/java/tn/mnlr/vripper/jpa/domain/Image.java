package tn.mnlr.vripper.jpa.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import tn.mnlr.vripper.host.Host;
import tn.mnlr.vripper.jpa.domain.enums.Status;

import java.util.Objects;

@Getter
@Setter
@ToString
@NoArgsConstructor
public class Image {

    @JsonIgnore
    protected Long id;

    @JsonIgnore
    private Host host;

    private String url;

    private int index;

    private long current = 0;

    private long total = 0;

    private Status status;

    private String postId;

    @JsonIgnore
    private Long postIdRef;

    public Image(String postId, String url, Host host, int index) {
        this.postId = postId;
        this.url = url;
        this.host = host;
        this.index = index;
        status = Status.STOPPED;
    }


    public void increase(int read) {
        current += read;
    }

    public void init() {
        current = 0;
        status = Status.STOPPED;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Image image = (Image) o;
        return Objects.equals(url, image.url);
    }

    @Override
    public int hashCode() {
        return Objects.hash(url);
    }
}
