// je récupère tous les champs des formulaires
const nom = document.getElementById("nom");
const prenom = document.getElementById("prenom");
const email = document.getElementById("email");
const mdp = document.getElementById("password");
const confirmation = document.getElementById("confirmation");
const submit = document.querySelector('.signup .submit');

// je sélectionne toutes les pages pour pouvoir les afficher ou les cacher
const pageAccueil = document.querySelector('.accueil');
const pageInscription = document.querySelector('.inscription');
const pageConnexion = document.querySelector('.connexion');
const pageModification = document.querySelector('.modification');
const pageProfil = document.querySelector('.profil');
const pageFil = document.querySelector('.fil');
const pagePublication = document.querySelector('.publication');

// je stocke les utilisateurs et les publications en mémoire
let utilisateurs = [];
let utilisateurConnecte = null;
let avatarSignup = null;
let avatarEdit = null;
let publications = [];
let imagePublication = null;

// je sauvegarde la liste des utilisateurs dans le localStorage
function sauvegarderUtilisateurs() {
  try {
    localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));
    return true;
  } catch (e) {
    // je préviens l'utilisateur si l'image est trop lourde pour le localStorage et je returne false pour annuler
      alert("L'image dépasse la limite de stockage du navigateur");
    return false;
  }
}

// je recharge les utilisateurs depuis le localStorage au démarrage
function chargerUtilisateurs() {
  const data = localStorage.getItem("utilisateurs");
  if (data !== null) {
    utilisateurs = JSON.parse(data);
  }
}

// je sauvegarde les publications dans le localStorage
function sauvegarderPublications() {
  try {
    localStorage.setItem("publications", JSON.stringify(publications));
    return true;
  } catch (e) {
    // même gestion d'erreur que pour les utilisateurs
    alert("L'image dépasse la limite de stockage du navigateur");
    return false;
  }
}

// je recharge les publications depuis le localStorage au démarrage comme pour les utilisateurs
function chargerPublications() {
  const data = localStorage.getItem("publications");
  if (data !== null) {
    publications = JSON.parse(data);
  }
}

// je cache toutes les pages puis j'affiche uniquement celle demandée
function afficherPage(nomPage) {
    pageAccueil.style.display = 'none';
    pageInscription.style.display = 'none';
    pageConnexion.style.display = 'none';
    pageModification.style.display = 'none';
    pageProfil.style.display = 'none';
    pageFil.style.display = 'none';
    pagePublication.style.display = 'none';
    if (nomPage === 'accueil') {
        pageAccueil.style.display = 'flex';
    } else if (nomPage === 'inscription') {
        pageInscription.style.display = 'flex';
    } else if (nomPage === 'connexion') {
        pageConnexion.style.display = 'flex';
    } else if (nomPage === 'modification') {
        pageModification.style.display = 'flex';
    } else if (nomPage === 'profil') {
        pageProfil.style.display = 'flex';
    } else if (nomPage === 'fil') {
        pageFil.style.display = 'flex';
    } else if (nomPage === 'publication') {
        pagePublication.style.display = 'flex';
    }
}

// je mets à jour la page profil avec les infos de l'utilisateur connecté
function afficherProfil() {
  document.getElementById('profilNom').textContent = utilisateurConnecte.nom;
  document.getElementById('profilPrenom').textContent = utilisateurConnecte.prenom;
  document.getElementById('profilEmail').textContent = utilisateurConnecte.email;
  const photo = document.getElementById('photoPreview');

  // j'affiche la photo si elle existe sinon je montre le placeholder
  if (utilisateurConnecte.avatar) {
    photo.src = utilisateurConnecte.avatar;
    photo.style.display = 'block';
    photo.nextElementSibling.style.display = 'none';
  } else {
    photo.style.display = 'none';
    photo.nextElementSibling.style.display = 'block';
  }
}

// je mets à jour le nom et l'avatar dans la barre du fil
function mettreAJourFil() {
  document.querySelector('.fil .user-name').textContent =
    utilisateurConnecte.prenom + ' ' + utilisateurConnecte.nom;
  const avatarTopbar = document.querySelector('.fil .topbar .avatar-small');
  if (utilisateurConnecte.avatar) {
    avatarTopbar.style.backgroundImage = 'url(' + utilisateurConnecte.avatar + ')';
    avatarTopbar.style.backgroundSize = 'cover';
  }
  renderFeed();
}

// je pré-remplis le formulaire de modification avec les données actuelles
function preparerModification() {
  document.getElementById('editNom').value = utilisateurConnecte.nom;
  document.getElementById('editPrenom').value = utilisateurConnecte.prenom;
  document.getElementById('editEmail').value = utilisateurConnecte.email;
  const img = document.getElementById('avatarPreviewEdit');
  if (utilisateurConnecte.avatar) {
    img.src = utilisateurConnecte.avatar;
    img.style.display = 'block';
  } else {
    img.style.display = 'none';
  }
}

// je formate un timestamp en date lisible au format jour/mois/année heure:minute                                                                                              
function formaterDate(ts) {
  const d = new Date(ts);
  const date = d.toLocaleDateString('fr-FR');  
  const heure = d.toLocaleTimeString('fr-FR');
  return date + ' - ' + heure;
}

// je construis un article HTML pour une publication donnée
function creerArticle(pub) {
  const article = document.createElement('article');
  article.className = 'post';
  article.dataset.id = pub.id;

  // je crée l'avatar de l'auteur avec sa photo si elle existe
  const avatarDiv = document.createElement('div');
  avatarDiv.className = 'avatar-small';
  if (pub.auteurAvatar) {
    avatarDiv.style.backgroundImage = 'url(' + pub.auteurAvatar + ')';
    avatarDiv.style.backgroundSize = 'cover';
  }

  const body = document.createElement('div');
  body.className = 'post-body';

  // je construis l'entête avec le nom de l'auteur et la date
  const head = document.createElement('div');
  head.className = 'post-head';
  const auteurSpan = document.createElement('strong');
  auteurSpan.textContent = pub.auteurPrenom + ' ' + pub.auteurNom;
  const dateSpan = document.createElement('span');
  dateSpan.className = 'date';
  dateSpan.textContent = formaterDate(pub.date);
  head.appendChild(auteurSpan);
  head.appendChild(dateSpan);

  const texte = document.createElement('p');
  texte.textContent = pub.texte;

  const actions = document.createElement('div');
  actions.className = 'post-actions';

  // je colore le bouton like si l'utilisateur a déjà liké
  const likeBtn = document.createElement('button');
  likeBtn.type = 'button';
  likeBtn.className = 'like' + (pub.likes.includes(utilisateurConnecte.email) ? ' active' : '');
  likeBtn.textContent = '♡ Like (' + pub.likes.length + ')';
  likeBtn.addEventListener('click', function() {
    toggleLike(pub.id);
  });

  actions.appendChild(likeBtn);

  // je n'affiche le bouton supprimer que si c'est ma publication
  if (pub.auteurEmail === utilisateurConnecte.email) {
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete';
    deleteBtn.textContent = 'Supprimer';
    deleteBtn.addEventListener('click', function() {
      supprimerPublication(pub.id);
    });
    actions.appendChild(deleteBtn);
  }

  body.appendChild(head);
  body.appendChild(texte);

  // j'ajoute l'image seulement si la publication en contient une
  if (pub.image) {
    const img = document.createElement('img');
    img.src = pub.image;
    img.className = 'post-image';
    body.appendChild(img);
  }

  body.appendChild(actions);
  article.appendChild(avatarDiv);
  article.appendChild(body);
  return article;
}

// je vide le fil et je le reconstruis avec les publications filtrées ou toutes
function renderFeed(filtre) {
  const feed = document.getElementById('feed');
  feed.innerHTML = '';

  // je renverse la liste pour afficher les plus récentes en premier
  let liste = publications.slice().reverse();

  if (filtre) {
    const txt = filtre.texte.toLowerCase();
    const auteur = filtre.auteur.toLowerCase();
    // je filtre par texte et par auteur en même temps
    liste = liste.filter(function(p) {
      const matchTxt = txt === '' || p.texte.toLowerCase().includes(txt);
      const matchAuteur = auteur === '' ||
        (p.auteurPrenom + ' ' + p.auteurNom).toLowerCase().includes(auteur);
      return matchTxt && matchAuteur;
    });
  }

  // je signale qu'il n'y a rien à afficher si la liste est vide
  if (liste.length === 0) {
    const vide = document.createElement('p');
    vide.className = 'feed-vide';
    vide.textContent = 'Aucune publication pour le moment';
    feed.appendChild(vide);
    return;
  }

  liste.forEach(function(pub) {
    feed.appendChild(creerArticle(pub));
  });
}

// je crée un objet publication et je l'ajoute à la liste
function ajouterPublication(texte, image) {
  const pub = {
    id: Date.now(),
    auteurNom: utilisateurConnecte.nom,
    auteurPrenom: utilisateurConnecte.prenom,
    auteurEmail: utilisateurConnecte.email,
    auteurAvatar: utilisateurConnecte.avatar || null,
    texte: texte,
    image: image || null,
    date: Date.now(),
    likes: []
  };
  publications.push(pub);
  return sauvegarderPublications();
}

// j'ajoute ou je retire le like de l'utilisateur connecté sur une publication
function toggleLike(id) {
  const pub = publications.find(function(p) { return p.id === id; });
  if (!pub) return;
  const idx = pub.likes.indexOf(utilisateurConnecte.email);
  if (idx === -1) {
    pub.likes.push(utilisateurConnecte.email);
  } else {
    // je retire le like si j'avais déjà liké
    pub.likes.splice(idx, 1);
  }
  sauvegarderPublications();

  // je rafraîchis le fil en conservant le filtre actif si besoin
  const filtreTxt = document.getElementById('filSearchText').value;
  const filtreAuteur = document.getElementById('filSearchAuthor').value;
  if (filtreTxt || filtreAuteur) {
    renderFeed({ texte: filtreTxt, auteur: filtreAuteur });
  } else {
    renderFeed();
  }
}

// je supprime une publication et je mets à jour le fil
function supprimerPublication(id) {
  publications = publications.filter(function(p) { return p.id !== id; });
  sauvegarderPublications();

  const filtreTxt = document.getElementById('filSearchText').value;
  const filtreAuteur = document.getElementById('filSearchAuthor').value;
  if (filtreTxt || filtreAuteur) {
    renderFeed({ texte: filtreTxt, auteur: filtreAuteur });
  } else {
    renderFeed();
  }
}

// je gère la publication rapide depuis le fil sans image
document.getElementById('postForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const input = document.getElementById('postMessage');
  const texte = input.value.trim();
  if (texte === '') {
    alert("Le message ne peut pas être vide.");
    return;
  }
  if (!ajouterPublication(texte, null)) return;
  input.value = '';
  renderFeed();
});

// je déclenche le sélecteur de fichier quand on clique sur le bouton
document.getElementById('chooseImg').addEventListener('click', function() {
  document.getElementById('imgInput').click();
});

// je lis l'image choisie et je l'affiche en aperçu
document.getElementById('imgInput').addEventListener('change', function() {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    imagePublication = e.target.result;
    const img = document.getElementById('imgPreview');
    img.src = imagePublication;
    img.style.display = 'block';
    img.nextElementSibling.style.display = 'none';
    document.getElementById('filename').textContent = file.name;
  };
  reader.readAsDataURL(file);
});

// je valide et publie le formulaire avec image
document.getElementById('pubForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const texte = document.getElementById('pubText').value.trim();
  const msg = document.getElementById('message');

  if (texte === '') {
    msg.textContent = "Le texte de la publication est obligatoire.";
    msg.className = 'message error';
    return;
  }

  if (!ajouterPublication(texte, imagePublication)) return;

  msg.textContent = "Publication ajoutée !";
  msg.className = 'message success';

  // je réinitialise le formulaire après publication
  document.getElementById('pubText').value = '';
  document.getElementById('imgPreview').style.display = 'none';
  document.getElementById('imgPreview').nextElementSibling.style.display = 'block';
  document.getElementById('filename').textContent = 'Aucun fichier sélectionné';
  document.getElementById('imgInput').value = '';
  imagePublication = null;

  // je reviens au fil après un court délai pour que le message soit visible
  setTimeout(function() {
    msg.textContent = '';
    msg.className = 'message';
    mettreAJourFil();
    afficherPage('fil');
  }, 800);
});

// je filtre le fil en temps réel quand je tape dans la recherche
document.getElementById('filSearchText').addEventListener('input', function() {
  renderFeed({
    texte: this.value,
    auteur: document.getElementById('filSearchAuthor').value
  });
});
document.getElementById('filSearchAuthor').addEventListener('input', function() {
  renderFeed({
    texte: document.getElementById('filSearchText').value,
    auteur: this.value
  });
});

// j'ouvre le sélecteur de fichier pour la photo de profil à l'inscription
document.getElementById('chooseBtnSignup').addEventListener('click', function() {
  document.getElementById('avatarInputSignup').click();
});

// je lis et j'affiche l'avatar choisi lors de l'inscription
document.getElementById('avatarInputSignup').addEventListener('change', function() {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    avatarSignup = e.target.result;
    const img = document.getElementById('avatarPreviewSignup');
    img.src = avatarSignup;
    img.style.display = 'block';
  };
  reader.readAsDataURL(file);
});

// j'ouvre le sélecteur de fichier pour changer la photo sur la page modification
document.getElementById('chooseBtnEdit').addEventListener('click', function() {
  document.getElementById('avatarInputEdit').click();
});
document.getElementById('avatarInputEdit').addEventListener('change', function() {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    avatarEdit = e.target.result;
    const img = document.getElementById('avatarPreviewEdit');
    img.src = avatarEdit;
    img.style.display = 'block';
  };
  reader.readAsDataURL(file);
});

// je valide le formulaire d'inscription champ par champ
submit.addEventListener("click", function (event) {
  event.preventDefault();

  if (nom.value === "") {
    alert("Veuillez entrer votre nom");
    return;
  }
  if (prenom.value === "") {
    alert("Veuillez entrer votre prénom");
    return;
  }
  if (email.value === "") {
    alert("Veuillez entrer votre adresse email");
    return;
  }
  if (mdp.value === "") {
    alert("Veuillez entrer votre mot de passe");
    return;
  }
  if (confirmation.value === "") {
    alert("Veuillez confirmer votre mot de passe");
    return;
  }
  if (mdp.value !== confirmation.value) {
    alert("Les mots de passe ne correspondent pas");
    return;
  }

  // je vérifie qu'aucun compte n'existe déjà avec cet email
  for (let i = 0; i < utilisateurs.length; i++) {
    if (utilisateurs[i].email === email.value) {
      alert("Un compte avec cet email existe déjà");
      return;
    }
  }

  // je crée l'objet utilisateur et je l'enregistre
  const utilisateur = {
    nom: nom.value,
    prenom: prenom.value,
    email: email.value,
    password: mdp.value,
    avatar: avatarSignup || null
  };

  utilisateurs.push(utilisateur);
  if (!sauvegarderUtilisateurs()) {
    // j'annule l'ajout si la sauvegarde échoue
    utilisateurs.pop();
    return;
  }

  utilisateurConnecte = utilisateur;
  afficherProfil();
  afficherPage('profil');
});

// je vérifie les identifiants et je connecte l'utilisateur
document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const loginEmail = document.getElementById('loginEmail').value;
  const loginPassword = document.getElementById('loginPassword').value;

  const utilisateur = utilisateurs.find(function(u) {
    return u.email === loginEmail && u.password === loginPassword;
  });

  // je bloque si l'email ou le mot de passe est incorrect
  if (utilisateur === undefined) {
    alert("Email ou mot de passe incorrect");
    return;
  }

  utilisateurConnecte = utilisateur;
  afficherProfil();
  afficherPage('profil');
});

// je sauvegarde les modifications du profil après vérification de l'ancien mot de passe
document.getElementById('editForm').addEventListener('submit', function(event) {
  event.preventDefault();

  if (document.getElementById('editOldPassword').value !== utilisateurConnecte.password) {
    alert("Ancien mot de passe incorrect");
    return;
  }

  utilisateurConnecte.nom = document.getElementById('editNom').value;
  utilisateurConnecte.prenom = document.getElementById('editPrenom').value;
  utilisateurConnecte.email = document.getElementById('editEmail').value;

  // je ne change le mot de passe que si un nouveau a été saisi
  if (document.getElementById('editNewPassword').value !== "") {
    utilisateurConnecte.password = document.getElementById('editNewPassword').value;
  }
  if (avatarEdit) {
    utilisateurConnecte.avatar = avatarEdit;
    avatarEdit = null;
  }

  // je mets à jour l'utilisateur dans le tableau global
  for (let i = 0; i < utilisateurs.length; i++) {
    if (utilisateurs[i].email === utilisateurConnecte.email) {
      utilisateurs[i] = utilisateurConnecte;
    }
  }

  if (!sauvegarderUtilisateurs()){
      return;
  }
  afficherProfil();
  afficherPage('profil');
});

// je branche les boutons de navigation entre les pages
document.querySelector('.accueil .btn-pink').addEventListener('click', function() {
    afficherPage('connexion');
});
document.querySelector('.accueil .btn-yellow').addEventListener('click', function() {
    afficherPage('inscription');
});

document.querySelector('.modification .btn-red').addEventListener('click', function() {
    afficherPage('profil');
});

document.querySelector('.profil .btn-green').addEventListener('click', function() {
    mettreAJourFil();
    afficherPage('fil');
});
document.querySelector('.profil .btn-red').addEventListener('click', function() {
  
    // je déconnecte l'utilisateur en vidant la variable
    utilisateurConnecte = null;
    afficherPage('accueil');
});
document.querySelector('.edit-link a').addEventListener('click', function() {
    preparerModification();
    afficherPage('modification');
});
document.querySelector('.fil .btn-red').addEventListener('click', function() {
    utilisateurConnecte = null;
    afficherPage('accueil');
});
document.querySelector('.more-link a').addEventListener('click', function() {
    afficherPage('publication');
});
document.querySelector('.publication .btn-red').addEventListener('click', function() {
    afficherPage('fil');
});
document.querySelector('.inscription .btn-back').addEventListener('click', function() {
    afficherPage('accueil');
});
document.querySelector('.connexion .btn-back').addEventListener('click', function() {
    afficherPage('accueil');
});
document.querySelector('.fil .topbar .btn-back').addEventListener('click', function() {
    afficherProfil();
    afficherPage('profil');
});

// je charge les données et j'affiche la page d'accueil au démarrage
chargerUtilisateurs();
chargerPublications();
afficherPage('accueil');
