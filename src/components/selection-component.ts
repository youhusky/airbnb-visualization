import * as d3 from '../d3';

import { BaseComponent } from './base-component';
import { Dispatch, DispatchEvent, LoadEventData, SelectEventData, HighlightEventData, FilterEventData } from '../data/dispatch';
import { Attribute } from '../data/attribute';
import { Listing, Neighborhood } from '../data/listing';
import { Block } from '../data/block';

export class SelectionComponent extends BaseComponent {

    private view: {
        neighborhoodSelectionList?: d3.DataSelection<Neighborhood>;
        listingsSelectionList?: d3.DataSelection<Listing>;
        priceBlocksSelectionList?: d3.DataSelection<Block>;
        markupBlocksSelectionList?: d3.DataSelection<Block>;
        amenitiesSelectionList?: d3.DataSelection<string>;

        links?: d3.DatalessSelection;
    }

    public constructor(selector: string, dispatcher: Dispatch) {
        super(selector, dispatcher);

        let self = this;

        this.view = {};
        this.view.links = d3.select(this.element.parentElement).select('.selection-links');
        this.view.links
            .select('a.reset')
            .on('click', () => {
                this.dispatcher.call(DispatchEvent.Select, this, Dispatch.emptySelection());
            });
        this.view.links
            .select('a.apply-filter')
            .on('click', function() {
                let disabled = d3.select(this).classed('disabled');

                if (!disabled) {
                    self.dispatcher.call(DispatchEvent.Filter, self, Dispatch.filterFromSelection(self.selection));
                    self.dispatcher.call(DispatchEvent.Select, self, Dispatch.emptySelection());
                }
            });
    }  
    private enforceHeight() {
        // Enforce the maximum height of the selection
        let height = this.element.clientHeight;
        d3.select(this.element)
          .select('.selection-container')
            .style('max-height', `${height - 10}px`);
    }

    public onSelect(selection: SelectEventData) {
        super.onSelect(selection);
        this.render();
    }

    public resize() {

    }

    private renderNeighborhoods() {
        let self = this;

        let selectionSelection = d3.select(this.selector)
            .select('.selection-neighborhoods')
            .selectAll('div')
            .data(this.selection.neighborhoods || [], (d: Neighborhood) => d.name);

        let selectionEnter = selectionSelection
          .enter()
          .append('div')
            .text(d => d.name)
            .on('click', function(d) {
                // Send out a deselection event for this neighborhood
                self.dispatchNeighborhoodSelection(d, false);
            });

        let selectionExit = selectionSelection.exit().remove();
        this.view.neighborhoodSelectionList = selectionSelection.merge(selectionEnter);
    }

    private renderListings() {
        let self = this;
        
        let selectionSelection = d3.select(this.selector)
            .select('.selection-listings')
            .selectAll('div')
            .data(this.selection.listings || [], (d: Listing) => d.id + '');

        let selectionEnter = selectionSelection
          .enter()
          .append('div')
            .text(d => d.name)
            .on('click', function(d) {
                // Send out a deselection event for this listing
                self.dispatchListingSelection(d, false);
            });

        let selectionExit = selectionSelection.exit().remove();
        this.view.listingsSelectionList = selectionSelection.merge(selectionEnter);
    }

    private renderPriceBlocks() {
        let self = this;
        
        let selectionSelection = d3.select(this.selector)
            .select('.selection-price-blocks')
            .selectAll('div')
            .data(this.selection.priceBlocks || [], (d: Block) => d.number + '');

        let selectionEnter = selectionSelection
          .enter()
          .append('div')
            .text(d => {
                let label = '$' + d.minimum.toFixed(0);

                if (isNaN(d.maximum)) {
                    label += '+';
                } 
                else {
                    label += ' - $' + d.maximum.toFixed(0);
                }

                return label;
            })
            .on('click', function(d) {
                // Send out a deselection event for this price block
                self.dispatchBlockSelection(d, false);
            });

        let selectionExit = selectionSelection.exit().remove();
        this.view.priceBlocksSelectionList = selectionSelection.merge(selectionEnter);
    }

    private renderMarkupBlocks() {
        let self = this;
        
        let selectionSelection = d3.select(this.selector)
            .select('.selection-markup-blocks')
            .selectAll('div')
            .data(this.selection.markupBlocks || [], (d: Block) => d.number + '');

        let selectionEnter = selectionSelection
          .enter()
          .append('div')
            .text(d => {
                let label = d.minimum.toFixed(0);

                if (isNaN(d.maximum)) {
                    label += '+%';
                } 
                else {
                    label += '% - ' + d.maximum.toFixed(0) + '%';
                }

                return label;
            })
            .on('click', function(d) {
                // Send out a deselection event for this markup block
                self.dispatchBlockSelection(d, false);
            });

        let selectionExit = selectionSelection.exit().remove();
        this.view.markupBlocksSelectionList = selectionSelection.merge(selectionEnter);
    }

    private renderAmenities() {
        let self = this;
        
        let selectionSelection = d3.select(this.selector)
            .select('.selection-amenities')
            .selectAll('div')
            .data(this.selection.amenities || [], (amenity: string) => amenity);

        let selectionEnter = selectionSelection
          .enter()
          .append('div')
            .text(d => d)
            .on('click', function(d) {
                // Send out a deselection event for this amenity
                self.dispatchAmenitySelection(d, false);
            });

        let selectionExit = selectionSelection.exit().remove();
        this.view.amenitiesSelectionList = selectionSelection.merge(selectionEnter);
    }

    private renderSelectionLinks() {
        // let pluralize = (count: number, word: string) => {
        //     let label = count + ' ';
            
        //     if (count === 1) {
        //         label += word;
        //     }
        //     else {
        //         if (word.charAt(word.length - 1) == 'y') {
        //             label += word.slice(0, word.length - 1) + 'ies';
        //         }
        //         else {
        //             label += word + 's';
        //         }
        //     }

        //     return label;
        // };

        if (Dispatch.isEmptySelection(this.selection)) {
            this.view.links.style('display', 'none');
        }
        else {
            if (Dispatch.isOnlyListingSelection(this.selection)) {
                this.view.links.select('.apply-filter').attr('class', 'apply-filter disabled');
            }
            else {
                this.view.links.select('.apply-filter').attr('class', 'apply-filter');
            }

            this.view.links.style('display', 'inline-block');
        }
    }

    public render() {
        let self = this;

        this.enforceHeight();
        this.renderNeighborhoods();
        this.renderListings();
        this.renderPriceBlocks();
        this.renderMarkupBlocks();
        this.renderAmenities();
        this.renderSelectionLinks();
    }
} 