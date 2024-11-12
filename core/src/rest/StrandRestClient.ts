import type { Id } from './model/Id.js';
import type { Strand, StrandPost } from './model/Strand.js';
import type { RestClient } from './RestClient.js';


export class StrandRestClient {

    constructor(private readonly restClient: RestClient) { }

    /** Returns a list of all published strands. Optionally include unpublished versions of your own scripts. */
    public list(): Promise<Strand[]> {
        return this.restClient.get('/api/strands');
    }

    /** Return specific strand version */
    public byId(strandId: Id): Promise<Strand> {
        return this.restClient.get(`/api/strands/${strandId}`);
    }

    /** Creates or updates a strand */
    public save(strand: StrandPost): Promise<Strand> {
        return this.restClient.post('/api/strands', strand);
    }

    /** Deletes the draft (unpublished) version of the given strandId */
    public delete(strandId: Id): Promise<void> {
        return this.restClient.delete(`/api/strands/${strandId}`);
    }


}

