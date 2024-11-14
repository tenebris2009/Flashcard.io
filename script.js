const decks = {
    data: JSON.parse(localStorage.getItem('flashcardDecks')) || []
  };
  
  const Home = {
    template: `
      <div class="home">
        <h1>Welcome to the Flashcard App</h1>
        <button @click="goToDeckPage">Go to Decks</button>
        <button @click="goToTestPage">Start a Test</button>
      </div>
    `,
    methods: {
      goToDeckPage() {
        this.$root.currentComponent = Deck;
      },
      goToTestPage() {
        this.$root.currentComponent = Test;
      }
    }
  };
  
  const Deck = {
    template: `
      <div class="deck">
        <h1>Decks</h1>
        <div v-if="!isCreating && !isEditing">
          <button @click="startCreateDeck">Create Deck</button>
          <button @click="startEditDecks" v-if="decks.length">Edit Decks</button>
          <button @click="goToHome">Back to Home</button>
          
          <div class="deck-list" v-if="decks.length">
            <h2>Your Decks:</h2>
            <div v-for="deck in decks" :key="deck.id" class="deck-item">
              <h3>{{deck.name}} ({{deck.cards.length}} cards)</h3>
            </div>
          </div>
        </div>
  
        <div v-if="isCreating" class="create-deck">
          <h2>Create New Deck</h2>
          <input v-model="newDeck.name" placeholder="Deck Name" class="input">
          <div class="cards-list">
            <div v-for="(card, index) in newDeck.cards" :key="index" class="card-input">
              <input v-model="card.question" placeholder="Question" class="input">
              <input v-model="card.answer" placeholder="Answer" class="input">
              <button @click="removeCard(index)" class="small-btn">Remove</button>
            </div>
          </div>
          <button @click="addCard">Add Card</button>
          <button @click="saveDeck">Save Deck</button>
          <button @click="cancelCreate">Cancel</button>
        </div>
  
        <div v-if="isEditing" class="edit-decks">
          <h2>Edit Decks</h2>
          <div v-for="deck in decks" :key="deck.id" class="deck-edit">
            <div class="deck-header">
              <input v-model="deck.name" class="input">
              <button @click="deleteDeck(deck.id)" class="small-btn">Delete Deck</button>
            </div>
            <div class="cards-list">
              <div v-for="(card, index) in deck.cards" :key="index" class="card-input">
                <input v-model="card.question" placeholder="Question" class="input">
                <input v-model="card.answer" placeholder="Answer" class="input">
                <button @click="removeCardFromDeck(deck, index)" class="small-btn">Remove</button>
              </div>
            </div>
            <button @click="addCardToDeck(deck)">Add Card</button>
          </div>
          <button @click="saveChanges">Save Changes</button>
          <button @click="cancelEdit">Cancel</button>
        </div>
      </div>
    `,
    data() {
      return {
        decks: decks.data,
        isCreating: false,
        isEditing: false,
        newDeck: {
          name: '',
          cards: []
        }
      };
    },
    methods: {
      startCreateDeck() {
        this.isCreating = true;
        this.newDeck = {
          name: '',
          cards: [{question: '', answer: ''}]
        };
      },
      startEditDecks() {
        this.isEditing = true;
      },
      addCard() {
        this.newDeck.cards.push({question: '', answer: ''});
      },
      removeCard(index) {
        this.newDeck.cards.splice(index, 1);
      },
      saveDeck() {
        if (this.newDeck.name && this.newDeck.cards.length) {
          const deck = {
            id: Date.now(),
            name: this.newDeck.name,
            cards: this.newDeck.cards
          };
          this.decks.push(deck);
          localStorage.setItem('flashcardDecks', JSON.stringify(this.decks));
          this.isCreating = false;
        }
      },
      addCardToDeck(deck) {
        deck.cards.push({question: '', answer: ''});
      },
      removeCardFromDeck(deck, index) {
        deck.cards.splice(index, 1);
      },
      deleteDeck(deckId) {
        this.decks = this.decks.filter(deck => deck.id !== deckId);
        localStorage.setItem('flashcardDecks', JSON.stringify(this.decks));
      },
      saveChanges() {
        localStorage.setItem('flashcardDecks', JSON.stringify(this.decks));
        this.isEditing = false;
      },
      cancelCreate() {
        this.isCreating = false;
      },
      cancelEdit() {
        this.decks = JSON.parse(localStorage.getItem('flashcardDecks')) || [];
        this.isEditing = false;
      },
      goToHome() {
        this.$root.currentComponent = Home;
      }
    }
  };
  
  const Test = {
    template: `
      <div class="test">
        <h1>Flashcard Test</h1>
        
        <!-- Deck Selection Screen -->
        <div v-if="!selectedDeck" class="deck-selection">
          <h2>Choose a Deck</h2>
          <div class="deck-list">
            <div v-for="deck in decks" :key="deck.id" class="deck-item" @click="selectDeck(deck)">
              <h3>{{deck.name}}</h3>
              <p>{{deck.cards.length}} cards</p>
            </div>
          </div>
          <button @click="goToHome">Back to Home</button>
        </div>
  
        <!-- Testing Screen -->
        <div v-else>
          <div class="test-info">
            <h2>{{selectedDeck.name}}</h2>
            <p>Remaining: {{remainingCards.length}} | Incorrect: {{incorrectCards.length}}</p>
          </div>
  
          <div v-if="currentCard" class="flashcard-container">
            <div class="flashcard" 
                 ref="flashcard"
                 :class="{ 'flip': isFlipped, 'swipe-left': isWrong, 'swipe-right': isCorrect }"
                 @click="flipCard">
              <div class="flashcard-front">
                <h2>{{ currentCard.question }}</h2>
              </div>
              <div class="flashcard-back">
                <h2>{{ currentCard.answer }}</h2>
              </div>
            </div>
          </div>
  
          <!-- Test Complete Screen -->
          <div v-if="!currentCard && remainingCards.length === 0" class="test-complete">
            <h2>Test Complete!</h2>
            <p>Incorrect answers: {{incorrectCards.length}}</p>
            <div v-if="incorrectCards.length > 0">
              <button @click="restartWithIncorrect">Practice Incorrect Cards</button>
            </div>
            <button @click="resetTest">Choose Another Deck</button>
            <button @click="goToHome">Back to Home</button>
          </div>
  
          <div v-if="currentCard" class="controls">
            <div class="button-controls">
              <button @click.stop="handleSwipe(false)" class="wrong-btn">Wrong</button>
              <button @click.stop="flipCard" class="flip-btn">
                {{ isFlipped ? 'Next Card' : 'Reveal Answer' }}
              </button>
              <button @click.stop="handleSwipe(true)" class="correct-btn">Correct</button>
            </div>
            <p class="swipe-hint">
              Swipe right if correct, left if incorrect<br>
              Or use arrow keys: ← for incorrect, → for correct
            </p>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        decks: decks.data,
        selectedDeck: null,
        remainingCards: [],
        incorrectCards: [],
        currentCard: null,
        isFlipped: false,
        isCorrect: false,
        isWrong: false,
        hammerManager: null
      };
    },
    methods: {
      selectDeck(deck) {
        this.selectedDeck = deck;
        this.remainingCards = [...deck.cards];
        this.incorrectCards = [];
        this.shuffleCards();
        this.nextCard();
      },
      shuffleCards() {
        for (let i = this.remainingCards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [this.remainingCards[i], this.remainingCards[j]] = 
          [this.remainingCards[j], this.remainingCards[i]];
        }
      },
      nextCard() {
        this.isFlipped = false;
        this.isCorrect = false;
        this.isWrong = false;
        
        if (this.remainingCards.length > 0) {
          this.currentCard = this.remainingCards[0];
          this.initializeHammer();
        } else {
          this.currentCard = null;
        }
      },
      flipCard() {
        if (this.isFlipped) {
          this.nextCard();
        } else {
          this.isFlipped = true;
        }
      },
      handleSwipe(isCorrect) {
        if (!this.isFlipped) return; // Prevent swiping before seeing answer
        
        this.isCorrect = isCorrect;
        this.isWrong = !isCorrect;
        
        const currentCard = this.remainingCards.shift();
        
        if (!isCorrect) {
          this.incorrectCards.push(currentCard);
        }
        
        setTimeout(() => {
          this.nextCard();
        }, 300);
      },
      initializeHammer() {
        // Clean up existing Hammer instance
        if (this.hammerManager) {
          this.hammerManager.destroy();
        }
  
        // Initialize new Hammer instance
        this.$nextTick(() => {
          const flashcard = this.$refs.flashcard;
          if (flashcard) {
            this.hammerManager = new Hammer.Manager(flashcard);
            this.hammerManager.add(new Hammer.Swipe({
              direction: Hammer.DIRECTION_HORIZONTAL,
              threshold: 5,
              velocity: 0.1
            }));
  
            this.hammerManager.on('swipeleft', () => {
              if (this.isFlipped) {
                this.handleSwipe(false);
              }
            });
  
            this.hammerManager.on('swiperight', () => {
              if (this.isFlipped) {
                this.handleSwipe(true);
              }
            });
          }
        });
      },
      restartWithIncorrect() {
        this.remainingCards = [...this.incorrectCards];
        this.incorrectCards = [];
        this.shuffleCards();
        this.nextCard();
      },
      resetTest() {
        if (this.hammerManager) {
          this.hammerManager.destroy();
        }
        this.selectedDeck = null;
        this.remainingCards = [];
        this.incorrectCards = [];
        this.currentCard = null;
        this.isFlipped = false;
      },
      goToHome() {
        if (this.hammerManager) {
          this.hammerManager.destroy();
        }
        this.$root.currentComponent = Home;
      },
      handleKeydown(event) {
        if (!this.currentCard || !this.isFlipped) return;
        
        if (event.key === 'ArrowLeft') {
          this.handleSwipe(false);
        } else if (event.key === 'ArrowRight') {
          this.handleSwipe(true);
        }
      }
    },
    mounted() {
      // Add keyboard controls
      window.addEventListener('keydown', this.handleKeydown);
    },
    beforeDestroy() {
      // Clean up
      window.removeEventListener('keydown', this.handleKeydown);
      if (this.hammerManager) {
        this.hammerManager.destroy();
      }
    }
  };
  
  new Vue({
    el: '#app',
    data: {
      currentComponent: Home
    }
  });